# MCUTrack Setup Guide

**Last Updated**: March 2026  
**Version**: 2.0.0 (Go Backend)

---

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Go 1.21+** - [Download](https://go.dev/dl/)
3. **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)

---

## Step 1: Install Go

### Windows Installation:
1. Download Go dari [go.dev/dl/](https://go.dev/dl/)
2. Run installer `go1.xx.x.windows-amd64.msi`
3. Klik Next melalui wizard instalasi
4. Install ke default location (`C:\Go`)
5. Restart terminal/PowerShell

### Verify Go:
```bash
go version
# Output: go version go1.21.x windows/amd64
```

---

## Step 2: Install PostgreSQL

### Windows Installation:
1. Download PostgreSQL 15+ dari [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer, keep default port **5432**
3. Set password untuk `postgres` user (ingat password ini!)
4. Install pgAdmin 4 (included)

### Verify PostgreSQL:
```bash
# Open Command Prompt
psql -U postgres
# Enter password, you should see postgres=# prompt
\q  # to exit
```

---

## Step 3: Create Database

```bash
# Open Command Prompt
psql -U postgres

# Create database
CREATE DATABASE mcutrack;
\q
```

---

## Step 4: Install Frontend Dependencies

```bash
cd C:\Users\Apinkko\Desktop\MCUTrack
npm install
```

---

## Step 5: Setup Backend

### Navigate to backend folder:
```bash
cd backend
```

### Download Go dependencies:
```bash
go mod download
```

### Configure environment:
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Edit `.env` dengan konfigurasi Anda:
```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/mcutrack?sslmode=disable
SERVER_PORT=8080
JWT_SECRET=your-random-secret-key-here
ENV=development
```

**Important:**
- Ganti `YOUR_PASSWORD` dengan password PostgreSQL Anda
- Generate `JWT_SECRET` dengan random string (min 32 karakter)

Generate JWT Secret (optional):
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 256 }))
```

---

## Step 6: Seed Database

```bash
# From backend folder
go run cmd/seed/main.go
```

Expected output:
```
Database connection established
Database migration completed
Created user: admin@hospital.com (ADMIN)
Created user: nurse@hospital.com (NURSE)
Created user: lab@hospital.com (LAB)
Created user: radiology@hospital.com (RADIOLOGY)
Created user: doctor@hospital.com (DOCTOR)
Created package: BASIC
Created package: EXEC
Created package: PREEMP
Seeding completed successfully!
```

---

## Step 7: Configure Frontend

Copy `.env.local.example` to `.env.local`:
```bash
# From project root
copy .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Step 8: Start Development Servers

### Option A: Run both servers together (Recommended)

```bash
# From project root
npm run dev:all
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### Option B: Run separately (2 terminals)

**Terminal 1 - Backend:**
```bash
cd backend
go run main.go
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## Step 9: Access the Application

Open browser: [http://localhost:3000](http://localhost:3000)

### Default Login Credentials:

| Email | Password | Role |
|-------|----------|------|
| admin@hospital.com | admin123 | ADMIN |
| nurse@hospital.com | admin123 | NURSE |
| lab@hospital.com | admin123 | LAB |
| radiology@hospital.com | admin123 | RADIOLOGY |
| doctor@hospital.com | admin123 | DOCTOR |

---

## Testing the API

### Health Check
```bash
curl http://localhost:8080/health
# Expected: {"status":"ok"}
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@hospital.com\",\"password\":\"admin123\"}"
```

### Get Current User (after login)
```bash
curl http://localhost:8080/api/me ^
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

---

## Development Commands

### Frontend
```bash
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Backend
```bash
npm run dev:backend      # Start Go dev server (port 8080)
npm run backend:download # Download Go dependencies
npm run backend:seed     # Seed database
npm run backend:build    # Build Go binary
npm run backend:run      # Run Go binary
```

### Both Servers
```bash
npm run dev:all          # Start frontend + backend together
```

---

## Project Structure Overview

```
MCUTrack/
├── backend/                 # Go backend
│   ├── main.go             # Entry point
│   ├── config/             # Configuration
│   ├── models/             # Database models
│   ├── handlers/           # API handlers
│   ├── middleware/         # Auth middleware
│   └── cmd/seed/           # Database seeder
├── src/                     # Next.js frontend
│   ├── app/                # Pages
│   ├── components/         # UI components
│   └── lib/
│       └── api-client.js   # API client
└── package.json            # Node dependencies
```

---

## Troubleshooting

### Go not recognized
```
'go' is not recognized as an internal or external command
```
**Solution:** Install Go dan restart terminal. Pastikan `C:\Go\bin` ada di PATH.

### Database connection error
```
failed to connect to database
```
**Solution:**
1. Pastikan PostgreSQL berjalan
2. Cek DATABASE_URL di `backend/.env`
3. Test koneksi: `psql postgres://localhost:5432/mcutrack`

### Port already in use
```
bind: address already in use
```
**Solution:**
1. Ubah SERVER_PORT di `backend/.env`
2. Atau kill process yang menggunakan port 8080

### Frontend can't connect to backend
```
Network error
```
**Solution:**
1. Pastikan backend running
2. Cek NEXT_PUBLIC_API_URL di `.env.local`
3. Test: `curl http://localhost:8080/health`

### CORS error
```
Access to fetch has been blocked by CORS policy
```
**Solution:** Pastikan backend CORS config mengizinkan frontend origin di `backend/main.go`

---

## Verification Checklist

Setelah setup, pastikan semua ini bekerja:

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

## Next Steps

1. ✅ Setup complete
2. 📚 Read [README.md](README.md) for project overview
3. 🏗️ Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. 📖 Check [GO_SETUP.md](GO_SETUP.md) for detailed Go guide
5. 🔄 See [MIGRATION.md](MIGRATION.md) for migration details

---

## Additional Resources

- **[README.md](README.md)** - Project overview and quick start
- **[GO_SETUP.md](GO_SETUP.md)** - Detailed Go backend setup
- **[MIGRATION.md](MIGRATION.md)** - Migration guide from Node.js
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Folder structure
- **[CHECKLIST.md](CHECKLIST.md)** - Setup checklist

---

**For support, contact the MCUTrack development team.**
