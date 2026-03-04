# MCUTrack Project Structure

**Last Updated**: March 2026  
**Version**: 2.0.0 (Go Backend)

---

## Overview

This document describes the folder structure and organization of the MCUTrack project.

---

## Root Structure

```
MCUTrack/
├── backend/                 # Go backend application
├── src/                     # Next.js frontend application
├── prisma/                  # Prisma schema (reference only)
├── node_modules/            # Node.js dependencies
├── .git/                    # Git repository
├── .next/                   # Next.js build output
│
├── package.json             # Node.js dependencies & scripts
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── jsconfig.json            # JavaScript configuration
├── .env.local.example       # Environment variables template
├── .gitignore               # Git ignore rules
│
├── README.md                # Project overview
├── GO_SETUP.md              # Go backend setup guide
├── MIGRATION.md             # Migration guide (Node.js → Go)
├── ARCHITECTURE.md          # System architecture
├── SETUP.md                 # Installation guide
├── SECURITY.md              # Security documentation
├── ROLES.md                 # User roles documentation
├── MVP_SCOPE.md             # Feature scope
└── PROJECT_STRUCTURE.md     # This file
```

---

## Backend Structure (`/backend`)

```
backend/
├── main.go                  # Application entry point
├── go.mod                   # Go module definition
├── go.sum                   # Go dependencies checksum
├── .env                     # Environment variables (gitignore)
├── .env.example             # Environment template
├── README.md                # Backend documentation
│
├── config/
│   └── config.go            # Configuration management
│                            # - Load environment variables
│                            # - Database connection string
│                            # - JWT secret
│                            # - Server port
│
├── models/
│   └── models.go            # GORM models
│                            # - User
│                            # - Patient
│                            # - Visit
│                            # - MCUPackage
│                            # - PackageStep
│                            # - VisitStep
│                            # - MedicalResult
│                            # - AuditLog
│                            # - Enums (Role, Gender, Department, etc.)
│
├── handlers/
│   ├── auth.go              # Authentication handlers
│                            # - Login
│                            # - Logout
│                            # - GetCurrentUser
│   │
│   ├── patient.go           # Patient handlers
│                            # - CreatePatient
│                            # - GetPatients
│                            # - GetPatientByID
│                            # - UpdatePatient
│   │
│   ├── visit.go             # Visit handlers
│                            # - CreateVisit
│                            # - GetVisits
│                            # - GetVisitByID
│                            # - GetVisitWorkflow
│                            # - UpdateVisitStatus
│                            # - UpdateStepStatus
│                            # - GetDashboardStats
│   │
│   ├── package.go           # Package handlers
│                            # - CreatePackage
│                            # - GetPackages
│                            # - GetPackageByID
│                            # - TogglePackageStatus
│   │
│   └── audit.go             # Audit log handlers
│                            # - GetAuditLogs
│
├── middleware/
│   └── auth.go              # Authentication middleware
│                            # - JWT verification
│                            # - Role-based access control
│                            # - Token generation
│
└── cmd/
    └── seed/
        └── main.go          # Database seeding utility
                             # - Create default users
                             # - Create MCU packages
                             # - Create package steps
```

---

## Frontend Structure (`/src`)

```
src/
├── app/                     # Next.js App Router
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── layout.js        # Dashboard layout
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.js      # Main dashboard (stats, recent visits)
│   │   │
│   │   ├── patients/
│   │   │   └── page.js      # Patient list + registration
│   │   │
│   │   ├── visits/
│   │   │   ├── page.js      # Visit list
│   │   │   └── [id]/
│   │   │       └── page.js  # Visit detail view
│   │   │
│   │   ├── packages/
│   │   │   └── page.js      # MCU package management
│   │   │
│   │   ├── departments/
│   │   │   ├── nursing/
│   │   │   │   └── page.js  # Nursing station
│   │   │   ├── laboratory/
│   │   │   │   └── page.js  # Laboratory department
│   │   │   ├── radiology/
│   │   │   │   └── page.js  # Radiology department
│   │   │   └── doctor/
│   │   │       └── page.js  # Doctor assessment
│   │   │
│   │   ├── admin/
│   │   │   ├── page.js      # Admin dashboard
│   │   │   └── users/
│   │   │       └── page.js  # User management
│   │   │
│   │   └── reports/
│   │       └── page.js      # Report generation
│   │
│   ├── login/
│   │   └── page.js          # Login page (public)
│   │
│   ├── unauthorized/
│   │   └── page.js          # Access denied page
│   │
│   ├── globals.css          # Global styles
│   ├── layout.js            # Root layout
│   └── page.js              # Home page (redirects to dashboard)
│
├── components/
│   └── layout/
│       ├── header.js        # Top header with user info
│       └── sidebar.js       # Navigation sidebar
│
└── lib/
    ├── api-client.js        # REST API client utilities
    │                        # - fetchAPI wrapper
    │                        # - Auth API (login, logout, me)
    │                        # - Patients API
    │                        # - Visits API
    │                        # - Packages API
    │                        # - Admin API
    │
    ├── prisma.js            # Prisma client (reference only)
    ├── auth.js              # Auth utilities (reference only)
    ├── session.js           # Session management (reference only)
    ├── validators.js        # Zod schemas (reference only)
    ├── workflow.js          # Workflow logic (reference only)
    └── audit.js             # Audit logging (reference only)
```

---

## Database Structure (`/prisma`)

```
prisma/
├── schema.prisma            # Database schema (reference)
└── seed.js                  # Node.js seeder (deprecated)
```

> **Note**: The Go backend uses GORM for schema management. The Prisma schema is kept for reference only.

---

## Key Files Explained

### Backend Files

| File | Purpose |
|------|---------|
| `main.go` | Entry point, Gin router setup, CORS configuration |
| `config/config.go` | Environment variable management |
| `models/models.go` | GORM models matching database schema |
| `handlers/*.go` | HTTP request handlers (business logic) |
| `middleware/auth.go` | JWT authentication and authorization |
| `cmd/seed/main.go` | Database seeding utility |

### Frontend Files

| File | Purpose |
|------|---------|
| `app/(dashboard)/layout.js` | Dashboard layout with sidebar |
| `app/login/page.js` | Login page using Go API |
| `components/layout/header.js` | Header with user info and logout |
| `lib/api-client.js` | REST API client for Go backend |
| `middleware.js` | Next.js middleware for route protection |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `go.mod` | Go module definition and dependencies |
| `next.config.js` | Next.js configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `.env.local` | Frontend environment variables |
| `backend/.env` | Backend environment variables |

---

## Data Flow

### Authentication Flow

```
1. User submits login form
   → src/app/login/page.js
   → lib/api-client.js (loginApi)

2. API call to Go backend
   → POST /api/auth/login
   → backend/handlers/auth.go (Login)

3. Backend validates credentials
   → GORM query to database
   → Generate JWT token
   → Set cookie

4. Frontend receives response
   → Redirects to dashboard
   → Cookie stored for subsequent requests
```

### Data Fetching Flow

```
1. Page loads (client-side)
   → useEffect hook
   → API client function (e.g., getPatientsApi)

2. API call to Go backend
   → GET /api/patients
   → Cookie sent automatically

3. Backend validates JWT
   → middleware/auth.go
   → Extract user info from token

4. Handler fetches data
   → backend/handlers/patient.go
   → GORM query to PostgreSQL

5. Response sent to frontend
   → JSON data
   → React state update
   → UI re-render
```

---

## Naming Conventions

### Go Backend

- **Files**: snake_case (e.g., `auth.go`, `patient.go`)
- **Functions**: PascalCase (e.g., `Login`, `CreatePatient`)
- **Models**: PascalCase (e.g., `User`, `Visit`)
- **Variables**: camelCase (e.g., `userID`, `visitNumber`)

### Frontend

- **Files**: kebab-case (e.g., `api-client.js`)
- **Components**: PascalCase (e.g., `Header`, `Sidebar`)
- **Functions**: camelCase (e.g., `handleLogin`, `fetchData`)
- **Variables**: camelCase (e.g., `userData`, `isLoading`)

---

## Import Paths

### Go Backend

```go
import (
    "mcu-track/config"      // Internal package
    "mcu-track/models"       // Internal package
    "mcu-track/handlers"     // Internal package
    "mcu-track/middleware"   // Internal package
)
```

### Frontend

```javascript
import { getPatientsApi } from '@/lib/api-client'
import Header from '@/components/layout/header'
```

---

## Build Outputs

### Frontend

```
.next/
├── static/              # Compiled assets
├── server/              # Server-side code
├── build/               # Build metadata
└── output/              # Production build
```

### Backend

```
backend/
└── mcutrack-api         # Compiled binary (after go build)
```

---

## Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend (`backend/.env`)

```env
DATABASE_URL=postgres://user:pass@localhost:5432/mcutrack
SERVER_PORT=8080
JWT_SECRET=your-secret-key
ENV=development
```

---

## Dependencies

### Frontend (`package.json`)

- **next**: Next.js framework
- **react**: React library
- **tailwindcss**: Utility-first CSS
- **concurrently**: Run multiple commands

### Backend (`go.mod`)

- **gin-gonic/gin**: HTTP framework
- **gorm.io/gorm**: ORM library
- **gorm.io/driver/postgres**: PostgreSQL driver
- **golang-jwt/jwt**: JWT implementation
- **golang.org/x/crypto**: bcrypt for passwords

---

## Related Documentation

- **[README.md](README.md)** - Project overview and quick start
- **[GO_SETUP.md](GO_SETUP.md)** - Go backend setup guide
- **[MIGRATION.md](MIGRATION.md)** - Migration from Node.js to Go
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[SETUP.md](SETUP.md)** - Detailed installation guide

---

**Last Updated**: March 2026  
**Version**: 2.0.0
