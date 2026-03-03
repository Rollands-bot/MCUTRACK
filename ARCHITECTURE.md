# MCUTrack Architecture Overview

## System Design Summary

### Architecture Pattern
**3-Tier Architecture** with offline-first design:
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Presentation  │────▶│   Application   │────▶│     Data        │
│   (Next.js UI)  │◀────│   (Prisma ORM)  │◀────│   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Server components for data fetching, built-in routing |
| Prisma ORM | Type-safe queries, migration management, PostgreSQL native |
| PostgreSQL | Robust, ACID-compliant, hospital-grade reliability |
| Offline-first | No internet dependency for critical healthcare operations |
| Role-based access | HIPAA-aligned access control principles |
| Audit logging | Compliance and traceability for medical data |

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

### Step Execution Flow

```
1. Visit Created → All steps = WAITING
2. Department calls patient → Step = IN_PROGRESS
3. Department completes work → Step = DONE + Result submitted
4. All steps DONE → Visit = DONE (ready for doctor)
5. Doctor reviews → Final decision (FIT/UNFIT)
6. Visit finalized → Report generated
```

---

## Department Workflows

### Nursing (Check-in)
```
Patient arrives
    ↓
Verify identity + MRN
    ↓
Create visit (select package)
    ↓
Vitals measurement (BP, HR, Weight, Height)
    ↓
Mark nursing step DONE
    ↓
Direct to Lab/Radiology
```

### Laboratory
```
Receive patient/sample
    ↓
Perform tests (Hematology, Chemistry, etc.)
    ↓
Input results with reference ranges
    ↓
Flag abnormal values
    ↓
Mark lab step DONE
```

### Radiology
```
Receive imaging request
    ↓
Perform imaging (X-Ray, USG, etc.)
    ↓
Input findings (text + optional attachments)
    ↓
Mark radiology step DONE
```

### Doctor (Final Assessment)
```
Review all completed results
    ↓
Physical examination (if needed)
    ↓
Make FIT/UNFIT decision
    ↓
Add conditions/recommendations
    ↓
Finalize visit → Generate report
```

---

## Data Flow Diagram

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │ (registration)
       ▼
┌─────────────┐      ┌─────────────┐
│   Patient   │──────│   Visit     │
│   Record    │      │   Created   │
└─────────────┘      └──────┬──────┘
                            │
                            │ (package steps)
                            ▼
                   ┌─────────────────┐
                   │  Visit Steps    │
                   │  (per dept)     │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Nursing  │ │   Lab    │ │ Radiology│
       │  Result  │ │  Result  │ │  Result  │
       └────┬─────┘ └────┬─────┘ └────┬─────┘
            │            │            │
            └────────────┼────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   Doctor    │
                  │  Review     │
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   Final     │
                  │   Report    │
                  └─────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Network                                       │
│  - Localhost-only PostgreSQL                            │
│  - Hospital firewall rules                              │
│  - HTTPS (self-signed cert)                             │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Application                                   │
│  - Role-based access control                            │
│  - Session management (8hr expiry)                      │
│  - Input validation (Zod)                               │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Data                                          │
│  - Password hashing (bcrypt)                            │
│  - Sensitive field encryption                           │
│  - Audit logging (immutable)                            │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Compliance                                    │
│  - Access logs for all medical data                     │
│  - Data retention policies                              │
│  - Backup encryption                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Design (Single Location)
- PostgreSQL: Single instance, local server
- Next.js: Single server deployment
- Expected load: 50-100 visits/day, 10-20 concurrent users

### Future Scaling Options
1. **Read Replicas**: For reporting/analytics queries
2. **Connection Pooling**: PgBouncer for high concurrency
3. **Caching**: Redis for session + dashboard data
4. **Horizontal**: Multiple app servers behind reverse proxy

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 15.x |
| UI Library | React | 19.x |
| Styling | Tailwind CSS | 3.x |
| Backend | Next.js Server Actions | - |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 15+ |
| Auth | NextAuth.js | 5.x |
| Validation | Zod | 3.x |
| Password | bcrypt | 5.x |
| Deployment | Local Server | - |

---

## File Organization Principles

1. **Colocation**: Components near their routes
2. **Separation**: UI components vs business logic
3. **Type Safety**: Shared types in `/types`
4. **Server Actions**: All mutations in `/actions`
5. **Libraries**: Reusable logic in `/lib`

---

## Deployment Architecture (Local Hospital Server)

```
┌──────────────────────────────────────────────┐
│           Hospital Server (Windows)          │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │      MCUTrack Application              │  │
│  │  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │  Next.js     │  │  PostgreSQL    │  │  │
│  │  │  Server      │  │  (localhost)   │  │  │
│  │  │  (Port 3000) │  │  (Port 5432)   │  │  │
│  │  └──────────────┘  └────────────────┘  │  │
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

## Next Steps

1. **Initialize Project**: `npx create-next-app@latest`
2. **Install Dependencies**: Prisma, Zod, bcrypt, NextAuth
3. **Setup Database**: PostgreSQL local installation
4. **Run Migrations**: `npx prisma db push`
5. **Seed Data**: Create initial admin user + sample packages
6. **Start Development**: `npm run dev`
