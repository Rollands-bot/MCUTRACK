# MCUTrack Backend (Go)

Backend API untuk MCUTrack menggunakan **Go** dengan **Gin** framework dan **GORM** ORM.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Go 1.21+ |
| Framework | Gin |
| ORM | GORM |
| Database | PostgreSQL |
| Auth | JWT |
| Password | bcrypt |

## Quick Start

### 1. Install Dependencies

```bash
cd backend
go mod download
```

### 2. Setup Database

Pastikan PostgreSQL sudah terinstall dan berjalan.

```bash
# Buat database
createdb mcutrack

# Atau menggunakan psql
psql -U postgres
CREATE DATABASE mcutrack;
\q
```

### 3. Konfigurasi Environment

```bash
# Copy file contoh
cp .env.example .env

# Edit .env sesuai konfigurasi Anda
# DATABASE_URL=postgres://user:password@localhost:5432/mcutrack?sslmode=disable
# JWT_SECRET=<generate-random-string>
```

### 4. Seed Database

```bash
go run cmd/seed/main.go
```

Ini akan membuat:
- 5 user default (Admin, Nurse, Lab, Radiology, Doctor)
- 3 MCU Package dengan steps lengkap

### 5. Jalankan Server

```bash
go run main.go
```

Server akan berjalan di `http://localhost:8080`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/logout` | Logout user |
| GET | `/api/me` | Get current user |

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients?search=` | List patients |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/:id` | Get patient by ID |
| PUT | `/api/patients/:id` | Update patient |

### Visits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visits?status=` | List visits |
| POST | `/api/visits` | Create visit |
| GET | `/api/visits/:id` | Get visit by ID |
| GET | `/api/visits/:id/workflow` | Get visit workflow |
| PATCH | `/api/visits/:id/status` | Update visit status |
| PATCH | `/api/visits/steps/:stepId/status` | Update step status |
| GET | `/api/visits/dashboard/stats` | Dashboard statistics |

### Packages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | List packages |
| POST | `/api/packages` | Create package |
| GET | `/api/packages/:id` | Get package by ID |
| PATCH | `/api/packages/:id/toggle` | Toggle package status |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/audit-logs` | Get audit logs |

## Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@hospital.com | admin123 | ADMIN |
| nurse@hospital.com | admin123 | NURSE |
| lab@hospital.com | admin123 | LAB |
| radiology@hospital.com | admin123 | RADIOLOGY |
| doctor@hospital.com | admin123 | DOCTOR |

## Example Requests

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'
```

### Get Patients

```bash
curl http://localhost:8080/api/patients \
  -H "Cookie: session=<your-jwt-token>"
```

### Create Visit

```bash
curl -X POST http://localhost:8080/api/visits \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<your-jwt-token>" \
  -d '{"patientId":"<patient-id>","packageId":"<package-id>"}'
```

## Project Structure

```
backend/
├── main.go                 # Application entry point
├── go.mod                  # Go module definition
├── config/
│   └── config.go          # Configuration management
├── models/
│   └── models.go          # GORM models (database schema)
├── handlers/
│   ├── auth.go            # Authentication handlers
│   ├── patient.go         # Patient handlers
│   ├── visit.go           # Visit handlers
│   ├── package.go         # Package handlers
│   └── audit.go           # Audit log handlers
├── middleware/
│   └── auth.go            # JWT authentication middleware
└── cmd/
    └── seed/
        └── main.go        # Database seeding
```

## Development

### Run Tests

```bash
go test ./...
```

### Build Binary

```bash
go build -o mcutrack.exe
```

### Hot Reload (Development)

Install air:
```bash
go install github.com/cosmtrek/air@latest
```

Run:
```bash
air
```

## Database Schema

Backend Go menggunakan schema yang sama dengan Prisma:

- **User** - User accounts dengan role-based access
- **Patient** - Patient demographics
- **Visit** - MCU visit instances
- **MCUPackage** - Configurable MCU packages
- **PackageStep** - Steps per package
- **VisitStep** - Execution tracking per visit
- **MedicalResult** - Test results
- **AuditLog** - Audit trail untuk compliance

## Security

- ✅ Password hashing dengan bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Audit logging untuk semua operasi penting
- ✅ CORS configuration untuk frontend
- ✅ SQL injection prevention (GORM)

## Migration dari Next.js Backend

Backend Go ini adalah migrasi dari Next.js Server Actions. Semua fungsi bisnis tetap sama:

| Next.js Server Action | Go Handler |
|----------------------|------------|
| `loginAction` | `handlers.Login` |
| `createPatient` | `handlers.CreatePatient` |
| `createVisit` | `handlers.CreateVisit` |
| `updateVisitStatusAction` | `handlers.UpdateVisitStatus` |
| `updateStepStatusAction` | `handlers.UpdateStepStatus` |

## Troubleshooting

### Database Connection Error

Pastikan PostgreSQL berjalan dan DATABASE_URL benar:
```bash
# Test connection
psql postgres://localhost:5432/mcutrack
```

### Port Already in Use

Ubah SERVER_PORT di `.env`:
```
SERVER_PORT=8081
```

### JWT Secret

Generate secure JWT secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 256 }))
```

## License

Proprietary - Hospital Internal Use Only
