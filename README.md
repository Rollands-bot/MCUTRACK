# MCUTrack

**Hospital-grade Medical Check-Up Management System**

---

## Overview

MCUTrack is an offline-first MCU management system designed for hospital internal use. It manages the complete workflow of medical check-ups from patient registration to final doctor assessment.

---

## Features

- ✅ **Role-based Access** - Admin, Nurse, Lab, Radiology, Doctor
- ✅ **Dynamic MCU Packages** - Configurable examination steps per company
- ✅ **Step-based Workflow** - WAITING → IN_PROGRESS → DONE
- ✅ **Real-time Dashboard** - Live queue status per department
- ✅ **Structured Results** - Department-specific medical input forms
- ✅ **Final Assessment** - Doctor FIT/UNFIT decision
- ✅ **Audit Logging** - Complete traceability for compliance
- ✅ **Offline-first** - No internet dependency

---

## Tech Stack

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Validation | Zod |

### Backend
| Component | Technology |
|-----------|------------|
| Language | Go 1.21+ |
| Framework | Gin |
| ORM | GORM |
| Database | PostgreSQL (self-hosted) |
| Auth | JWT (JSON Web Token) |
| Password | bcrypt |

---

## Quick Start

### Prerequisites
1. **Node.js 18+** - For frontend
2. **Go 1.21+** - For backend
3. **PostgreSQL 15+** - Database

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies (in backend folder)
cd backend
go mod download
cd ..
```

### 2. Setup Database

```bash
# Create database
createdb mcutrack

# Or using psql
psql -U postgres
CREATE DATABASE mcutrack;
\q
```

### 3. Configure Environment

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgres://postgres:password@localhost:5432/mcutrack?sslmode=disable
SERVER_PORT=8080
JWT_SECRET=your-secret-key-change-in-production
ENV=development
```

### 4. Seed Database

```bash
npm run backend:seed
```

This creates:
- 5 default users (Admin, Nurse, Lab, Radiology, Doctor)
- 3 MCU packages with steps

### 5. Start Development

```bash
# Start both frontend and backend
npm run dev:all

# Or separately:
# Frontend only: npm run dev:frontend
# Backend only: npm run dev:backend
```

Open [http://localhost:3000](http://localhost:3000) for the frontend.

Backend API runs on [http://localhost:8080](http://localhost:8080).

---

## Demo Login

| Email | Password | Role |
|-------|----------|------|
| admin@hospital.com | admin123 | Administrator |
| nurse@hospital.com | admin123 | Nurse |
| lab@hospital.com | admin123 | Lab Tech |
| radiology@hospital.com | admin123 | Radiology |
| doctor@hospital.com | admin123 | Doctor |

---

## Documentation

- **[GO_SETUP.md](GO_SETUP.md)** - Go backend setup guide
- **[MIGRATION.md](MIGRATION.md)** - Migration guide from Node.js to Go
- **[SETUP.md](SETUP.md)** - Detailed installation guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
- **[ROLES.md](ROLES.md)** - User roles & responsibilities
- **[SECURITY.md](SECURITY.md)** - Security practices
- **[MVP_SCOPE.md](MVP_SCOPE.md)** - Feature scope
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Folder structure

---

## Workflow

```
┌─────────────┐
│   NURSE     │  Patient registration & vitals
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│    LAB      │     │  RADIOLOGY  │  Parallel examinations
└──────┬──────┘     └──────┬──────┘
       │                   │
       └────────┬──────────┘
                │
                ▼
         ┌─────────────┐
         │   DOCTOR    │  Final assessment (FIT/UNFIT)
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │   REPORT    │  Generated MCU report
         └─────────────┘
```

---

## Database Schema

**9 Core Tables:**
- User (roles & auth)
- Patient (demographics)
- Visit (MCU instances)
- MCUPackage (configurable packages)
- PackageStep (package steps)
- VisitStep (execution tracking)
- MedicalResult (test results)
- AuditLog (compliance)

See `prisma/schema.prisma` for the original schema (reference only).  
Go models are in `backend/models/models.go`.

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Get current user

### Patients
- `GET /api/patients?search=` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient

### Visits
- `GET /api/visits?status=` - List visits
- `POST /api/visits` - Create visit
- `GET /api/visits/:id` - Get visit by ID
- `GET /api/visits/:id/workflow` - Get visit workflow
- `PATCH /api/visits/:id/status` - Update visit status
- `PATCH /api/visits/steps/:stepId/status` - Update step status
- `GET /api/visits/dashboard/stats` - Dashboard statistics

### Packages
- `GET /api/packages` - List packages
- `POST /api/packages` - Create package
- `GET /api/packages/:id` - Get package by ID
- `PATCH /api/packages/:id/toggle` - Toggle package status

### Admin
- `GET /api/admin/audit-logs` - Get audit logs

---

## Development Commands

```bash
# Frontend
npm run dev:frontend     # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Backend
npm run dev:backend      # Start Go dev server
npm run backend:download # Download Go dependencies
npm run backend:seed     # Seed database
npm run backend:build    # Build Go binary
npm run backend:run      # Run Go binary

# Both
npm run dev:all          # Start frontend + backend
```

---

## Project Structure

```
MCUTrack/
├── backend/                 # Go backend
│   ├── main.go             # Entry point
│   ├── go.mod              # Go module
│   ├── .env                # Environment config
│   ├── config/             # Configuration
│   ├── models/             # Database models
│   ├── handlers/           # API handlers
│   ├── middleware/         # Auth middleware
│   └── cmd/seed/           # Database seeder
├── src/                    # Next.js frontend
│   ├── app/                # Pages (App Router)
│   ├── components/         # React components
│   └── lib/
│       └── api-client.js   # API client
├── prisma/                 # Prisma schema (reference)
└── package.json            # Node dependencies
```

---

## Security

- 🔐 Password hashing (bcrypt)
- 🔐 JWT-based authentication
- 🔐 Role-based access control (RBAC)
- 🔐 Audit logging (immutable)
- 🔐 Input validation
- 🔐 SQL injection prevention (GORM)
- 🔐 CORS configuration

---

## Deployment

MCUTrack is designed for **local hospital server** deployment:

### Backend Deployment

```bash
cd backend
go build -o mcutrack-api

# Deploy binary to server
# Run as systemd service or Docker container
```

### Frontend Deployment

```bash
npm run build
npm start
```

### Docker (Optional)

See `backend/Dockerfile` for containerization.

---

## License

Proprietary - Hospital Internal Use Only

---

## Support

For technical support, contact the MCUTrack development team.

---

## Changelog

### v2.0.0 (March 2026)
- ✅ Migrated backend from Node.js to Go
- ✅ Improved performance with Gin framework
- ✅ JWT-based authentication
- ✅ Better separation of concerns

### v1.0.0
- Initial release with Next.js full-stack
