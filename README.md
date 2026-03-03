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

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | JavaScript |
| ORM | Prisma 6 |
| Database | PostgreSQL (self-hosted) |
| Auth | Session-based (JWT) |
| Styling | Tailwind CSS |
| Validation | Zod |

---

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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

- **[SETUP.md](SETUP.md)** - Installation guide
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

See `prisma/schema.prisma` for full schema.

---

## Security

- 🔐 Password hashing (bcrypt)
- 🔐 Session-based authentication
- 🔐 Role-based access control
- 🔐 Audit logging (immutable)
- 🔐 Input validation (Zod)
- 🔐 SQL injection prevention (Prisma)

---

## Development

```bash
# Generate Prisma client
npm run db:generate

# Update database schema
npm run db:push

# Seed data
npm run db:seed

# Open Prisma Studio (DB browser)
npm run db:studio

# Production build
npm run build
npm start
```

---

## Deployment

MCUTrack is designed for **local hospital server** deployment:

1. Install PostgreSQL on hospital server
2. Deploy Next.js application
3. Configure firewall for local network access
4. Set up automated backups

See [SETUP.md](SETUP.md) for detailed deployment guide.

---

## License

Proprietary - Hospital Internal Use Only

---

## Support

For technical support, contact the MCUTrack development team.
