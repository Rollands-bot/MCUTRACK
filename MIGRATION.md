# MCUTrack Go Backend Migration Guide

Panduan migrasi dari Next.js Server Actions ke Go Backend API.

## Overview

Proyek MCUTrack telah dimigrasikan dari backend Next.js (Server Actions) ke **Go** dengan **Gin Framework** untuk performa dan skalabilitas yang lebih baik.

## Architecture Changes

### Before (Next.js Full-stack)
```
┌─────────────────┐
│   Next.js App   │
│  (React + SA)   │
│       │         │
│   ┌───▼───┐     │
│   │Prisma │     │
│   └───┬───┘     │
│       │         │
└───────┼─────────┘
        │
        ▼
 ┌─────────────┐
 │  PostgreSQL │
 └─────────────┘
```

### After (Go Backend + Next.js Frontend)
```
┌─────────────────┐     ┌─────────────────┐
│  Next.js (FE)   │────▶│  Go Backend     │
│   (React SPA)   │     │  (Gin + GORM)   │
│                 │     │       │         │
│                 │     │   ┌───▼───┐     │
│                 │     │   │ GORM  │     │
│                 │     │   └───┬───┘     │
│                 │     │       │         │
└─────────────────┘     └───────┼─────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  PostgreSQL │
                         └─────────────┘
```

## Setup Instructions

### 1. Install Go

Download dan install Go dari https://go.dev/dl/

Verifikasi instalasi:
```bash
go version
```

### 2. Setup Database

```bash
# Pastikan PostgreSQL berjalan
# Buat database baru
createdb mcutrack

# Atau via psql
psql -U postgres
CREATE DATABASE mcutrack;
\q
```

### 3. Setup Go Backend

```bash
cd backend

# Download dependencies
go mod download

# Copy environment file
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# DATABASE_URL=postgres://user:pass@localhost:5432/mcutrack
# JWT_SECRET=<random-string>

# Seed database
go run cmd/seed/main.go

# Jalankan server
go run main.go
```

Server akan berjalan di `http://localhost:8080`

### 4. Setup Frontend

```bash
# Di root project
cp .env.local.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Install dependencies (jika belum)
npm install

# Jalankan frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Running Both Servers

### Option 1: Manual (2 terminals)

Terminal 1 - Backend:
```bash
cd backend
go run main.go
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Option 2: Using npm scripts (Recommended)

Tambahkan di `package.json` root:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "next dev",
    "dev:backend": "cd backend && go run main.go",
    "build": "next build",
    "start": "next start",
    "backend:seed": "cd backend && go run cmd/seed/main.go"
  }
}
```

Install concurrently:
```bash
npm install -D concurrently
```

Jalankan:
```bash
npm run dev
```

## API Mapping

### Authentication

| Server Action | REST API | Method | Endpoint |
|--------------|----------|--------|----------|
| `loginAction` | Login | POST | `/api/auth/login` |
| `logoutAction` | Logout | POST | `/api/logout` |
| - | Get Current User | GET | `/api/me` |

### Patients

| Server Action | REST API | Method | Endpoint |
|--------------|----------|--------|----------|
| `createPatient` | Create Patient | POST | `/api/patients` |
| `getPatients` | List Patients | GET | `/api/patients?search=` |
| `getPatientById` | Get Patient | GET | `/api/patients/:id` |
| - | Update Patient | PUT | `/api/patients/:id` |

### Visits

| Server Action | REST API | Method | Endpoint |
|--------------|----------|--------|----------|
| `createVisit` | Create Visit | POST | `/api/visits` |
| `getVisits` | List Visits | GET | `/api/visits?status=` |
| `getVisitById` | Get Visit | GET | `/api/visits/:id` |
| `getVisitWorkflowAction` | Get Workflow | GET | `/api/visits/:id/workflow` |
| `updateVisitStatusAction` | Update Status | PATCH | `/api/visits/:id/status` |
| `updateStepStatusAction` | Update Step | PATCH | `/api/visits/steps/:stepId/status` |
| `getDashboardStats` | Dashboard Stats | GET | `/api/visits/dashboard/stats` |

### Packages

| Server Action | REST API | Method | Endpoint |
|--------------|----------|--------|----------|
| `createPackage` | Create Package | POST | `/api/packages` |
| `getPackages` | List Packages | GET | `/api/packages` |
| `getPackageById` | Get Package | GET | `/api/packages/:id` |
| `togglePackageStatus` | Toggle Status | PATCH | `/api/packages/:id/toggle` |

## Frontend Migration

### Before (Server Action)
```javascript
// app/login/page.js
import { loginAction } from '@/actions/auth-actions'

<form action={loginAction}>
  <input name="email" />
  <input name="password" type="password" />
  <button type="submit">Login</button>
</form>
```

### After (API Client)
```javascript
// app/login/page.js
import { loginApi } from '@/lib/api-client'

const handleSubmit = async (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)
  const result = await loginApi(
    formData.get('email'),
    formData.get('password')
  )
  if (result.success) {
    router.push('/')
  }
}

<form onSubmit={handleSubmit}>
  <input name="email" />
  <input name="password" type="password" />
  <button type="submit">Login</button>
</form>
```

## Files Changed

### New Files (Backend)
```
backend/
├── main.go
├── go.mod
├── config/
│   └── config.go
├── models/
│   └── models.go
├── handlers/
│   ├── auth.go
│   ├── patient.go
│   ├── visit.go
│   ├── package.go
│   └── audit.go
├── middleware/
│   └── auth.go
└── cmd/
    └── seed/
        └── main.go
```

### New Files (Frontend)
```
src/
└── lib/
    └── api-client.js
```

### Modified Files
```
src/
└── app/
    └── login/
        └── page.js  (updated to use API client)
```

## Benefits of Go Backend

### Performance
- ✅ **10-100x faster** request handling vs Node.js
- ✅ **Lower memory** footprint (~50MB vs ~200MB)
- ✅ **Native concurrency** with goroutines
- ✅ **Compiled binary** - no runtime overhead

### Scalability
- ✅ **Horizontal scaling** ready
- ✅ **Connection pooling** built-in
- ✅ **Better CPU utilization**
- ✅ **Microservices** ready

### Maintainability
- ✅ **Strong typing** with Go structs
- ✅ **Clear separation** of concerns
- ✅ **Easy testing** with standard library
- ✅ **Single binary** deployment

### Security
- ✅ **Type-safe** SQL with GORM
- ✅ **Built-in** CSRF protection
- ✅ **JWT** authentication
- ✅ **Audit logging** for compliance

## Development Workflow

### 1. Make Changes to Backend

Edit files in `backend/handlers/` or `backend/models/`

### 2. Hot Reload (Optional)

Install `air` for hot reload:
```bash
go install github.com/cosmtrek/air@latest
```

Run:
```bash
cd backend
air
```

### 3. Test API

```bash
# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'

# Test authenticated endpoint
curl http://localhost:8080/api/patients \
  -H "Cookie: session=<token-from-login>"
```

### 4. Update Frontend

Update `api-client.js` with new endpoints if needed

### 5. Test Integration

Open browser at `http://localhost:3000` and test the UI

## Deployment

### Backend Deployment

```bash
# Build binary
cd backend
go build -o mcutrack-api

# Deploy binary + .env to server
# Run as systemd service or Docker container
```

### Systemd Service Example

`/etc/systemd/system/mcutrack-api.service`:
```ini
[Unit]
Description=MCUTrack API Server
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mcutrack/backend
ExecStart=/var/www/mcutrack/backend/mcutrack-api
Restart=always
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

### Docker Deployment

`Dfile`:
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o mcutrack-api main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/mcutrack-api .
EXPOSE 8080
CMD ["./mcutrack-api"]
```

## Troubleshooting

### Backend won't start

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep mcutrack

# Check .env file
cat backend/.env
```

### Frontend can't connect to backend

```bash
# Check API_URL in .env.local
cat .env.local

# Test backend directly
curl http://localhost:8080/health
```

### CORS errors

Ensure backend CORS config allows frontend origin:
```go
// backend/main.go
c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
```

### Database migration errors

```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE IF EXISTS mcutrack;
CREATE DATABASE mcutrack;
\q

# Re-seed
cd backend
go run cmd/seed/main.go
```

## Next Steps

1. ✅ Backend Go berjalan dengan semua endpoint
2. ✅ Frontend terhubung ke Go API
3. ⏳ Migrate remaining Server Actions ke API calls
4. ⏳ Add unit tests untuk Go handlers
5. ⏳ Setup CI/CD pipeline
6. ⏳ Deploy to production server

## Support

Untuk pertanyaan atau issue, hubungi tim development MCUTrack.

---

**Last Updated**: March 2026  
**Version**: 1.0.0
