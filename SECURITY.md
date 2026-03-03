# MCUTrack Security Best Practices

## Hospital-Grade Medical Data Security

### 1. Authentication & Authorization

```typescript
// middleware.ts - Role-based route protection
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

export async function middleware(request: NextRequest) {
  const session = await getSession()
  const { pathname } = request.nextUrl

  // Protected routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  const roleRoutes = {
    ADMIN: ['/admin', '/patients', '/visits', '/packages', '/reports'],
    DOCTOR: ['/departments/doctor', '/visits', '/patients', '/reports'],
    NURSE: ['/departments/nursing', '/visits', '/patients'],
    LAB: ['/departments/laboratory', '/visits'],
    RADIOLOGY: ['/departments/radiology', '/visits']
  }

  const userRole = session.user.role
  const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || []
  
  const isAllowed = allowedRoutes.some(route => pathname.startsWith(route))
  
  if (!isAllowed) {
    await logAudit({
      userId: session.user.id,
      action: AuditAction.PERMISSION_DENIED,
      entityType: EntityType.USER,
      entityId: session.user.id,
      newValue: { attemptedPath: pathname }
    })
    
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}
```

### 2. Data Encryption

```typescript
// .env
DATABASE_URL="postgresql://user:password@localhost:5432/mcustrack"
ENCRYPTION_KEY="<32-byte-random-key>" // For sensitive field encryption
SESSION_SECRET="<random-secret>"

// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH)
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag().toString('hex')
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

### 3. Input Validation (Zod Schemas)

```typescript
// lib/validators.ts
import { z } from 'zod'

export const patientSchema = z.object({
  mrn: z.string().regex(/^\d{10}$/, 'MRN must be 10 digits'),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.date().refine(d => d < new Date(), 'Must be in the past'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  idNumber: z.string().optional()
})

export const labResultSchema = z.object({
  testCode: z.string(),
  value: z.number(),
  unit: z.string(),
  referenceRangeMin: z.number().optional(),
  referenceRangeMax: z.number().optional(),
  flag: z.enum(['NORMAL', 'LOW', 'HIGH', 'CRITICAL']).optional(),
  notes: z.string().optional()
})

export const visitTransitionSchema = z.object({
  visitId: z.string().cuid(),
  newStatus: z.enum(['WAITING', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
  notes: z.string().optional()
})
```

### 4. Server Actions Security

```typescript
// actions/visit-actions.ts
'use server'

import { auth } from '@/lib/auth'
import { transitionVisit } from '@/lib/workflow'
import { visitTransitionSchema } from '@/lib/validators'

export async function updateVisitStatus(formData: FormData) {
  const session = await auth()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const data = {
    visitId: formData.get('visitId'),
    newStatus: formData.get('newStatus'),
    notes: formData.get('notes')
  }

  // Validate input
  const parsed = visitTransitionSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid input', details: parsed.error.flatten() }
  }

  // Execute with audit logging
  const result = await transitionVisit(
    parsed.data.visitId,
    parsed.data.newStatus,
    session.user.id,
    session.user.role,
    { notes: parsed.data.notes }
  )

  return result
}
```

### 5. Database Security

```prisma
// Row-level security considerations
// - All queries filtered by user role/permissions
// - Sensitive fields encrypted at rest
// - Audit log immutable (no delete/update allowed)

// Connection pooling for local PostgreSQL
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### 6. Session Management

```typescript
// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET)

export async function createSession(payload: {
  userId: string
  role: string
  email: string
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  } catch {
    return null
  }
}
```

### 7. File Upload Security (Medical Attachments)

```typescript
// actions/upload-result.ts
'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadMedicalFile(file: FormDataEntryValue) {
  if (!(file instanceof Blob)) {
    return { error: 'Invalid file' }
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'File type not allowed' }
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return { error: 'File too large' }
  }

  // Generate secure filename
  const extension = file.type.split('/')[1]
  const filename = `${randomUUID()}.${extension}`
  
  // Store outside web root
  const uploadDir = join(process.cwd(), 'uploads', 'medical')
  const filepath = join(uploadDir, filename)
  
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  await writeFile(filepath, buffer)
  
  return { 
    success: true, 
    path: filepath, // Store in database, not served directly
    originalName: file.name 
  }
}
```

### 8. Rate Limiting (Local Network)

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit' // Or custom implementation

const loginLimiter = new Ratelimit({
  redis: 'localhost:6379', // Local Redis for rate limiting
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts per minute
  analytics: true
})

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/login') {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await loginLimiter.limit(ip)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many login attempts' },
        { status: 429 }
      )
    }
  }
  
  return NextResponse.next()
}
```

### 9. Security Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}
```

### 10. Audit Log Immutability

```prisma
// schema.prisma - Audit log cannot be modified
model AuditLog {
  id         String   @id @default(cuid())
  // ... fields
  
  // No update/delete permissions in application layer
  // Database user for app should have INSERT only on AuditLog table
}
```

### 11. Local Network Security Checklist

- [ ] PostgreSQL bound to localhost only (`127.0.0.1`)
- [ ] Database credentials in `.env` (not committed)
- [ ] HTTPS enabled even on local network (self-signed cert)
- [ ] Firewall rules restricting access to hospital network
- [ ] Regular database backups (encrypted)
- [ ] Session timeout after 8 hours of inactivity
- [ ] Automatic logout on browser close
- [ ] No sensitive data in client-side state
- [ ] All medical data access logged
- [ ] Regular security audits of audit logs
