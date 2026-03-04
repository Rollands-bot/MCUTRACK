# MCUTrack - Go Backend Setup Guide

## Prerequisites

### 1. Install Go

Download dan install Go dari https://go.dev/dl/

**Windows Installation:**
1. Download installer `go1.xx.x.windows-amd64.msi`
2. Run installer dan klik Next
3. Install ke default location (`C:\Go`)
4. Restart terminal/PowerShell
5. Verifikasi: `go version`

### 2. Install PostgreSQL

Download dari https://www.postgresql.org/download/windows/

Atau gunakan PostgreSQL portable untuk development.

### 3. Install Node.js Dependencies

```bash
npm install
```

## Quick Start (Windows)

### Option 1: Using Setup Script (Recommended)

```powershell
.\setup-backend.ps1
```

Script ini akan:
- Cek apakah Go terinstall
- Download dependencies
- Buat file .env dari template
- Tawarkan untuk seed database

### Option 2: Manual Setup

#### Step 1: Setup Environment

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Edit `.env`:
```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/mcutrack?sslmode=disable
SERVER_PORT=8080
JWT_SECRET=your-random-secret-key-here
ENV=development
```

#### Step 2: Download Dependencies

```powershell
cd backend
go mod download
```

#### Step 3: Seed Database

```powershell
go run cmd/seed/main.go
```

#### Step 4: Run Backend

```powershell
go run main.go
```

Server akan berjalan di `http://localhost:8080`

## Running Both Servers

### Install concurrently (if not already installed)

```bash
npm install
```

### Run both frontend + backend

```bash
npm run dev:all
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Testing the API

### Health Check

```bash
curl http://localhost:8080/health
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

### Get Patients

```bash
curl http://localhost:8080/api/patients ^
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

## Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@hospital.com | admin123 | ADMIN |
| nurse@hospital.com | admin123 | NURSE |
| lab@hospital.com | admin123 | LAB |
| radiology@hospital.com | admin123 | RADIOLOGY |
| doctor@hospital.com | admin123 | DOCTOR |

## Troubleshooting

### Go not recognized

```
'go' is not recognized as an internal or external command
```

**Solution:** Install Go dan restart terminal, atau tambahkan ke PATH manual:
```powershell
$env:Path += ";C:\Go\bin"
```

### Database connection error

```
failed to connect to database
```

**Solution:**
1. Pastikan PostgreSQL berjalan
2. Cek DATABASE_URL di `.env`
3. Test koneksi:
   ```powershell
   psql -U postgres -d mcutrack
   ```

### Port already in use

```
bind: address already in use
```

**Solution:**
1. Ubah SERVER_PORT di `backend\.env`
2. Atau kill process yang menggunakan port 8080

### CORS error di browser

```
Access to fetch at 'http://localhost:8080' has been blocked by CORS policy
```

**Solution:** Pastikan frontend memanggil backend dengan URL yang benar di `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Project Structure

```
MCUTrack/
├── backend/                 # Go backend
│   ├── main.go             # Entry point
│   ├── go.mod              # Dependencies
│   ├── .env                # Environment config
│   ├── config/             # Configuration
│   ├── models/             # Database models
│   ├── handlers/           # API handlers
│   ├── middleware/         # Auth middleware
│   └── cmd/seed/           # Database seeder
├── src/                    # Next.js frontend
│   ├── app/                # Pages
│   ├── components/         # React components
│   └── lib/
│       └── api-client.js   # API client
└── package.json            # Node dependencies
```

## Development Workflow

1. **Start database** (PostgreSQL)
2. **Seed database** (one time):
   ```bash
   npm run backend:seed
   ```
3. **Run both servers**:
   ```bash
   npm run dev:all
   ```
4. **Make changes** to backend or frontend
5. **Test** at http://localhost:3000

## Build for Production

### Backend

```bash
npm run backend:build
npm run backend:run
```

### Frontend

```bash
npm run build
npm start
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Run frontend + backend |
| `npm run dev:backend` | Run backend only |
| `npm run backend:download` | Download Go dependencies |
| `npm run backend:seed` | Seed database |
| `npm run backend:build` | Build backend binary |
| `npm run backend:run` | Run backend binary |

## Next Steps

1. ✅ Setup Go backend
2. ✅ Seed database dengan sample data
3. ✅ Test API endpoints
4. ✅ Connect frontend ke Go API
5. ⏳ Develop remaining features
6. ⏳ Write tests
7. ⏳ Deploy to production

## Resources

- [Go Documentation](https://go.dev/doc/)
- [Gin Framework](https://gin-gonic.com/docs/)
- [GORM](https://gorm.io/docs/)
- [MCUTrack Migration Guide](MIGRATION.md)

---

For support, contact the MCUTrack development team.
