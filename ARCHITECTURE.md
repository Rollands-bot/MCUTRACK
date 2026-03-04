# MCUTrack Architecture Overview

## System Design Summary

### Architecture Pattern
**Client-Server Architecture** with Go backend and Next.js frontend:
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│     Data        │
│   (Next.js)     │◀────│   (Go + Gin)    │◀────│   (PostgreSQL)  │
│   Port: 3000    │ HTTP│   Port: 8080    │ GORM│   Port: 5432    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Go Backend | High performance, compiled language, excellent concurrency |
| Gin Framework | Lightweight, fast HTTP router with middleware support |
| GORM ORM | Type-safe queries, automatic migrations, PostgreSQL native |
| Next.js Frontend | React-based, modern UI, client-side rendering |
| PostgreSQL | Robust, ACID-compliant, hospital-grade reliability |
| JWT Auth | Stateless authentication, scalable, secure |
| Role-based access | HIPAA-aligned access control principles |
| Audit logging | Compliance and traceability for medical data |

---

## System Architecture

### Component Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                    │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │   API Client        │  │
│  │   (Routes)  │  │   (UI)      │  │   (REST calls)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                         Backend (Go + Gin)                    │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Router    │  │  Handlers   │  │   Middleware        │  │
│  │   (Gin)     │  │  (Logic)    │  │   (Auth, CORS)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                              │                               │
│                    ┌─────────▼─────────┐                     │
│                    │     Models        │                     │
│                    │   (GORM ORM)      │                     │
│                    └─────────┬─────────┘                     │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               │ SQL
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                    │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  User   │ │ Patient │ │  Visit   │ │  MCUPackage      │  │
│  └─────────┘ └─────────┘ └──────────┘ └──────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────────┐   │
│  │ PackageStep │ │ VisitStep   │ │  MedicalResult       │   │
│  └─────────────┘ └─────────────┘ └──────────────────────┘   │
│  ┌─────────────┐                                             │
│  │  AuditLog   │                                             │
│  └─────────────┘                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture (Go)

### Layer Structure

```
backend/
├── main.go              # Application entry point, routing
├── config/
│   └── config.go        # Configuration management (env vars)
├── models/
│   └── models.go        # GORM models (database schema)
├── handlers/
│   ├── auth.go          # Authentication handlers
│   ├── patient.go       # Patient CRUD handlers
│   ├── visit.go         # Visit management handlers
│   ├── package.go       # Package management handlers
│   └── audit.go         # Audit log handlers
├── middleware/
│   └── auth.go          # JWT authentication middleware
└── cmd/seed/
    └── main.go          # Database seeding utility
```

### Request Flow

```
HTTP Request
    │
    ▼
┌─────────────────┐
│  Gin Router     │  Route matching
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Middleware     │  Auth, CORS, Logging
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Handler        │  Business logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GORM Model     │  Database operations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │  Data persistence
└─────────────────┘
```

---

## Frontend Architecture (Next.js)

### Component Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── visits/
│   │   ├── packages/
│   │   └── departments/
│   └── login/              # Public login page
├── components/             # Reusable UI components
│   └── layout/             # Layout components (Header, Sidebar)
└── lib/
    └── api-client.js       # REST API client utilities
```

### Data Flow

```
User Action
    │
    ▼
┌─────────────────┐
│  React Event    │  onClick, onSubmit
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Client     │  fetch() wrapper
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Go Backend     │  HTTP POST/GET/PUT/PATCH
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JSON Response  │  Data update
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React State    │  Re-render UI
└─────────────────┘
```

---

## Workflow Engine Logic

### State Machine

```
                    ┌──────────────┐
                    │   WAITING    │
                    └──────┬───────┘
                           │ (Nurse checks in patient)
                           ▼
                    ┌──────────────┐
          ┌────────│ IN_PROGRESS  │────────┐
          │        └──────┬───────┘        │
          │               │                │
          │ (Lab/Rad      │ (All steps     │
          │  complete)    │  complete)     │
          │               │                │
          │               ▼                │
          │        ┌──────────────┐        │
          └───────▶│    DONE      │◀───────┘
                   └──────┬───────┘
                          │ (Doctor approval)
                          ▼
                   ┌──────────────┐
                   │   FINALIZED  │
                   └──────────────┘
```

---

## Data Models

### Core Entities

**User** - System users with role-based access
```go
type User struct {
    ID        string
    Email     string    // unique
    Password  string    // bcrypt hash
    Name      string
    Role      Role      // ADMIN, NURSE, LAB, RADIOLOGY, DOCTOR
    IsActive  bool
}
```

**Patient** - Patient demographics
```go
type Patient struct {
    ID          string
    MRN         string    // unique
    FirstName   string
    LastName    string
    DateOfBirth time.Time
    Gender      Gender
    Company     string
}
```

**Visit** - MCU visit instance
```go
type Visit struct {
    ID            string
    VisitNumber   string    // unique: MCU-YYYYMMDD-001
    PatientID     string
    PackageID     string
    Status        VisitStatus  // WAITING, IN_PROGRESS, DONE
    AssignedDoctorID string
}
```

**MCUPackage** - Configurable examination packages
```go
type MCUPackage struct {
    ID       string
    Name     string
    Code     string    // unique
    IsActive bool
    Steps    []PackageStep
}
```

**VisitStep** - Individual step execution tracking
```go
type VisitStep struct {
    ID            string
    VisitID       string
    PackageStepID string
    Status        StepStatus  // WAITING, IN_PROGRESS, DONE
    PerformedBy   string
}
```

**MedicalResult** - Examination results
```go
type MedicalResult struct {
    ID          string
    VisitID     string
    Department  Department
    ResultType  ResultType
    ResultData  string    // JSON
}
```

**AuditLog** - Compliance audit trail
```go
type AuditLog struct {
    ID         string
    UserID     string
    VisitID    string
    Action     AuditAction
    EntityType EntityType
    EntityID   string
    OldValue   string    // JSON
    NewValue   string    // JSON
    CreatedAt  time.Time
}
```

---

## Security Architecture

### Authentication Flow

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│  User   │      │  Next.js│      │   Go    │
│         │      │         │      │ Backend │
└────┬────┘      └────┬────┘      └────┬────┘
     │                │                │
     │  1. Login      │                │
     │───────────────>│                │
     │                │                │
     │                │  2. Validate   │
     │                │  Credentials   │
     │                │───────────────>│
     │                │                │
     │                │  3. Generate   │
     │                │  JWT Token     │
     │                │<───────────────│
     │                │                │
     │  4. Store      │                │
     │  Cookie        │                │
     │<───────────────│                │
     │                │                │
     │  5. Request    │                │
     │  + Cookie      │                │
     │───────────────>│                │
     │                │                │
     │                │  6. Verify JWT │
     │                │───────────────>│
     │                │                │
     │                │  7. Response   │
     │                │<───────────────│
     │<───────────────│                │
     │                │                │
```

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Network                                       │
│  - CORS configuration                                   │
│  - HTTPS (production)                                   │
│  - Firewall rules                                       │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Application                                   │
│  - JWT authentication                                   │
│  - Role-based access control                            │
│  - Input validation                                     │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Data                                          │
│  - Password hashing (bcrypt)                            │
│  - SQL injection prevention (GORM)                      │
│  - Audit logging (immutable)                            │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Compliance                                    │
│  - Access logs for all medical data                     │
│  - Data retention policies                              │
│  - Backup encryption                                    │
└─────────────────────────────────────────────────────────┘
```

---

## API Design

### RESTful Endpoints

```
Authentication
  POST   /api/auth/login       - Login
  POST   /api/logout           - Logout
  GET    /api/me               - Current user

Patients
  GET    /api/patients         - List patients
  POST   /api/patients         - Create patient
  GET    /api/patients/:id     - Get patient
  PUT    /api/patients/:id     - Update patient

Visits
  GET    /api/visits           - List visits
  POST   /api/visits           - Create visit
  GET    /api/visits/:id       - Get visit
  GET    /api/visits/:id/workflow - Get workflow
  PATCH  /api/visits/:id/status   - Update status
  PATCH  /api/visits/steps/:stepId/status - Update step
  GET    /api/visits/dashboard/stats - Statistics

Packages
  GET    /api/packages         - List packages
  POST   /api/packages         - Create package
  GET    /api/packages/:id     - Get package
  PATCH  /api/packages/:id/toggle - Toggle status

Admin
  GET    /api/admin/audit-logs - Audit trail
```

---

## Scalability Considerations

### Current Design (Single Location)
- PostgreSQL: Single instance, local server
- Go backend: Single server deployment
- Next.js frontend: Single server deployment
- Expected load: 50-100 visits/day, 10-20 concurrent users

### Future Scaling Options
1. **Read Replicas**: For reporting/analytics queries
2. **Connection Pooling**: Built-in GORM connection pooling
3. **Caching**: Redis for session + dashboard data
4. **Horizontal**: Multiple backend servers behind reverse proxy
5. **Load Balancer**: Nginx/HAProxy for traffic distribution

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | Next.js | 15.x | React framework |
| UI Library | React | 19.x | Component library |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Backend | Go | 1.21+ | Server language |
| HTTP Framework | Gin | 1.9+ | Web framework |
| ORM | GORM | 1.25+ | Database ORM |
| Database | PostgreSQL | 15+ | Relational DB |
| Auth | JWT | - | Token-based auth |
| Password | bcrypt | - | Password hashing |
| Deployment | Local Server | - | Hospital infrastructure |

---

## File Organization Principles

1. **Separation of Concerns**: Frontend and backend are separate projects
2. **API-First**: All data access through REST API
3. **Type Safety**: Go structs for models, PropTypes for React
4. **Reusability**: Shared utilities in `/lib`
5. **Convention**: Consistent naming and structure

---

## Deployment Architecture (Local Hospital Server)

```
┌──────────────────────────────────────────────┐
│           Hospital Server (Windows)          │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │      MCUTrack Application              │  │
│  │  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │  Next.js     │  │  Go Backend    │  │  │
│  │  │  Frontend    │  │  (Gin API)     │  │  │
│  │  │  (Port 3000) │  │  (Port 8080)   │  │  │
│  │  └──────────────┘  └───────┬────────┘  │  │
│  │                            │            │  │
│  │                  ┌─────────▼────────┐   │  │
│  │                  │   PostgreSQL     │   │  │
│  │                  │   (Port 5432)    │   │  │
│  │                  └──────────────────┘   │  │
│  └────────────────────────────────────────┘  │
│                    │                          │
│         (Hospital Network)                   │
│                    │                          │
│    ┌───────────────┼───────────────┐         │
│    │               │               │         │
│    ▼               ▼               ▼         │
│ ┌──────┐      ┌──────────┐   ┌──────────┐   │
│ │Nurse │      │   Lab    │   │  Doctor  │   │
│ │Station│     │ Terminal │   │  Office  │   │
│ └──────┘      └──────────┘   └──────────┘   │
└──────────────────────────────────────────────┘
```

---

## Monitoring & Observability

### Logging
- Go: Built-in log package with file output
- Next.js: Console logging in development
- Database: PostgreSQL query logs

### Health Checks
```bash
GET /health  # Backend health check
```

### Metrics to Track
- API response times
- Database query performance
- Active users
- Visit throughput
- Error rates

---

## Next Steps

1. ✅ Backend Go implemented with all endpoints
2. ✅ Frontend connected via REST API
3. ⏳ Add comprehensive testing
4. ⏳ Implement caching layer (Redis)
5. ⏳ Add monitoring and alerting
6. ⏳ Deploy to production environment

---

**Last Updated**: March 2026  
**Version**: 2.0.0 (Go Backend)
