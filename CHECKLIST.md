# MCUTrack - Setup Checklist

**Last Updated**: March 2026  
**Version**: 2.0.0 (Go Backend)

---

## ✅ Completed

### Backend (Go)
- [x] Go module setup (go.mod)
- [x] Database models (GORM)
- [x] Configuration management
- [x] Authentication middleware (JWT)
- [x] Auth handlers (login, logout, me)
- [x] Patient handlers (CRUD)
- [x] Visit handlers (CRUD + workflow)
- [x] Package handlers (CRUD)
- [x] Audit log handlers
- [x] Database seeder (cmd/seed)

### Frontend (Next.js)
- [x] Project structure (Next.js 15 App Router)
- [x] API client utilities
- [x] Login page (Go API integration)
- [x] Dashboard page
- [x] Patients page
- [x] Visits page
- [x] Packages page
- [x] Middleware for route protection
- [x] Layout components (header, sidebar)

### Documentation
- [x] README.md (updated for Go)
- [x] ARCHITECTURE.md (updated for Go)
- [x] PROJECT_STRUCTURE.md (updated for Go)
- [x] GO_SETUP.md (new - Go setup guide)
- [x] MIGRATION.md (new - Migration guide)
- [x] Backend README.md

---

## ⏳ Next Steps (User Action Required)

### Prerequisites

1. **Install Go** (if not already installed)
   ```
   Download: https://go.dev/dl/
   - Download installer for Windows
   - Run installer (default: C:\Go)
   - Restart terminal/PowerShell
   - Verify: go version
   ```

2. **Install PostgreSQL**
   ```
   Download: https://www.postgresql.org/download/windows/
   - Install PostgreSQL 15+
   - Keep default port 5432
   - Set password for postgres user
   ```

### Setup Steps

#### 1. Create Database
```bash
psql -U postgres

CREATE DATABASE mcutrack;
\q
```

#### 2. Setup Frontend
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
notepad .env.local
# Set: NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

#### 3. Setup Backend
```bash
# Navigate to backend
cd backend

# Copy environment file
cp .env.example .env

# Edit .env
notepad .env
# Update DATABASE_URL with your PostgreSQL credentials
# Generate JWT_SECRET (random string)
```

Example `backend/.env`:
```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/mcutrack?sslmode=disable
SERVER_PORT=8080
JWT_SECRET=your-random-secret-key-here
ENV=development
```

#### 4. Download Go Dependencies
```bash
cd backend
go mod download
```

#### 5. Seed Database
```bash
# From project root
npm run backend:seed

# Or from backend folder
cd backend
go run cmd/seed/main.go
```

This creates:
- 5 default users (Admin, Nurse, Lab, Radiology, Doctor)
- 3 MCU packages with steps

#### 6. Start Development

**Option A: Run both servers together (Recommended)**
```bash
# Install concurrently first
npm install

# Run both frontend + backend
npm run dev:all
```

**Option B: Run separately (2 terminals)**

Terminal 1 - Backend:
```bash
cd backend
go run main.go
```

Terminal 2 - Frontend:
```bash
npm run dev
```

---

## 🎯 Access the Application

Open http://localhost:3000

**Default Login Credentials:**

| Email | Password | Role |
|-------|----------|------|
| admin@hospital.com | admin123 | ADMIN |
| nurse@hospital.com | admin123 | NURSE |
| lab@hospital.com | admin123 | LAB |
| radiology@hospital.com | admin123 | RADIOLOGY |
| doctor@hospital.com | admin123 | DOCTOR |

---

## 📁 Files Created

### Backend
```
backend/
├── main.go                 ✅ Entry point
├── go.mod                  ✅ Go module
├── go.sum                  ✅ Dependencies checksum
├── .env                    ⚠️  Environment (create from .env.example)
├── .env.example            ✅ Template
├── README.md               ✅ Backend docs
├── config/
│   └── config.go           ✅ Configuration
├── models/
│   └── models.go           ✅ GORM models (9 models)
├── handlers/
│   ├── auth.go             ✅ Auth handlers
│   ├── patient.go          ✅ Patient handlers
│   ├── visit.go            ✅ Visit handlers
│   ├── package.go          ✅ Package handlers
│   └── audit.go            ✅ Audit handlers
├── middleware/
│   └── auth.go             ✅ JWT middleware
└── cmd/
    └── seed/
        └── main.go         ✅ Database seeder
```

### Frontend
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.js       ✅ Dashboard layout
│   │   ├── dashboard/
│   │   │   └── page.js     ✅ Main dashboard
│   │   ├── patients/
│   │   │   └── page.js     ✅ Patient list
│   │   ├── visits/
│   │   │   └── page.js     ✅ Visit list
│   │   ├── packages/
│   │   │   └── page.js     ✅ Package management
│   │   └── departments/
│   │       ├── nursing/    ✅ Nursing station
│   │       ├── laboratory/ ✅ Lab dashboard
│   │       ├── radiology/  ✅ Radiology dashboard
│   │       └── doctor/     ✅ Doctor dashboard
│   ├── login/
│   │   └── page.js         ✅ Login page (Go API)
│   ├── unauthorized/
│   │   └── page.js         ✅ 403 page
│   ├── globals.css         ✅ Styles
│   ├── layout.js           ✅ Root layout
│   └── page.js             ✅ Home redirect
├── components/
│   └── layout/
│       ├── header.js       ✅ Top bar (Go API)
│       └── sidebar.js      ✅ Navigation
└── lib/
    ├── api-client.js       ✅ REST API client
    ├── prisma.js           ⚠️  Reference only (deprecated)
    ├── auth.js             ⚠️  Reference only (deprecated)
    ├── session.js          ⚠️  Reference only (deprecated)
    ├── workflow.js         ⚠️  Reference only (deprecated)
    └── audit.js            ⚠️  Reference only (deprecated)
```

### Documentation
```
├── README.md               ✅ Main docs (updated for Go)
├── GO_SETUP.md             ✅ Go setup guide
├── MIGRATION.md            ✅ Migration guide (Node.js → Go)
├── ARCHITECTURE.md         ✅ System design (updated)
├── SETUP.md                ⚠️  Setup guide (needs update)
├── ROLES.md                ✅ User roles
├── SECURITY.md             ⚠️  Security (needs update)
├── MVP_SCOPE.md            ✅ Feature scope
├── PROJECT_STRUCTURE.md    ✅ Folder structure (updated)
└── CHECKLIST.md            ✅ This file
```

---

## 🔧 Available Commands

### Frontend
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Backend
```bash
npm run dev:backend      # Start Go dev server
npm run backend:download # Download Go dependencies
npm run backend:seed     # Seed database
npm run backend:build    # Build Go binary
npm run backend:run      # Run Go binary
```

### Both
```bash
npm run dev:all          # Start frontend + backend
```

---

## 🐛 Troubleshooting

### Go not recognized
```
'go' is not recognized as an internal or external command
```
**Solution:** Install Go dari https://go.dev/dl/ dan restart terminal.

### Database connection error
```
failed to connect to database
```
**Solution:** 
1. Pastikan PostgreSQL berjalan
2. Cek DATABASE_URL di `backend/.env`
3. Test: `psql postgres://localhost:5432/mcutrack`

### Port already in use
```
bind: address already in use
```
**Solution:** Ubah SERVER_PORT di `backend/.env` atau kill process yang pakai port 8080.

### Frontend can't connect to backend
```
Network error
```
**Solution:** 
1. Pastikan backend running di port 8080
2. Cek NEXT_PUBLIC_API_URL di `.env.local`
3. Test: `curl http://localhost:8080/health`

---

## ✅ Verification Checklist

Setelah setup, pastikan:

- [ ] Go terinstall (`go version`)
- [ ] PostgreSQL berjalan
- [ ] Database `mcutrack` dibuat
- [ ] Backend dependencies terdownload
- [ ] Frontend dependencies terinstall
- [ ] Backend running di http://localhost:8080
- [ ] Frontend running di http://localhost:3000
- [ ] Bisa login dengan admin@hospital.com / admin123
- [ ] Dashboard menampilkan statistik
- [ ] Bisa create patient
- [ ] Bisa create visit

---

## 📚 Next Steps After Setup

1. ✅ Setup complete
2. ⏳ Explore the application
3. ⏳ Test all workflows (nursing → lab → radiology → doctor)
4. ⏳ Review documentation
5. ⏳ Start development

---

## 🔗 Related Documents

- [README.md](README.md) - Project overview
- [GO_SETUP.md](GO_SETUP.md) - Detailed Go setup
- [MIGRATION.md](MIGRATION.md) - Migration guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Folder structure
