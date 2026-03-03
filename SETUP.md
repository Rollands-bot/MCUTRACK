# MCUTrack Setup Guide

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)

---

## Step 1: Install PostgreSQL (Local Server)

### Windows Installation:
1. Download PostgreSQL 15+ from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer, keep default port **5432**
3. Set password for `postgres` user (remember this!)
4. Install pgAdmin 4 (included)

### Verify PostgreSQL:
```bash
# Open Command Prompt
psql -U postgres
# Enter password, you should see postgres=# prompt
\q  # to exit
```

---

## Step 2: Create Database

```bash
# Open Command Prompt
psql -U postgres

# Create database and user
CREATE DATABASE mcustrack;
CREATE USER mcustrack_user WITH PASSWORD 'mcustrack123';
GRANT ALL PRIVILEGES ON DATABASE mcustrack TO mcustrack_user;
\q
```

---

## Step 3: Install Dependencies

```bash
cd C:\Users\Apinkko\Desktop\MCUTrack
npm install
```

---

## Step 4: Configure Environment

Edit `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://mcustrack_user:mcustrack123@localhost:5432/mcustrack?schema=public"
SESSION_SECRET="your-random-secret-min-32-characters-long"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

---

## Step 5: Setup Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with initial data
npm run db:seed
```

Expected output:
```
🌱 Seeding database...
✅ Created Admin user
✅ Created Nurse user
✅ Created Lab user
✅ Created Radiology user
✅ Created Doctor user
✅ Created Basic Package
✅ Created Executive Package
✅ Created Pre-Employment Package
🎉 Seeding completed!
```

---

## Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Nurse | nurse@hospital.com | admin123 |
| Lab | lab@hospital.com | admin123 |
| Radiology | radiology@hospital.com | admin123 |
| Doctor | doctor@hospital.com | admin123 |

---

## First Steps After Login

### As Admin:
1. Go to **Packages** to view/edit MCU packages
2. Go to **Patients** to register new patients
3. Go to **Audit Log** to see system activity

### As Nurse:
1. Go to **Nursing** station
2. Click **+ New Visit** to create a visit
3. Call patient from waiting queue
4. Input vitals and mark complete

### As Lab/Radiology:
1. Go to your **Department** page
2. See patients waiting for your tests
3. Click **Start** → **Complete** on steps
4. Input test results

### As Doctor:
1. Go to **Doctor Dashboard**
2. Review patients with all steps completed
3. Make FIT/UNFIT decision
4. Finalize report

---

## Troubleshooting

### Database Connection Error
```
Error: Can't reach database server at `localhost:5432`
```
**Solution:** Make sure PostgreSQL service is running
```bash
# Windows Services
services.msc
# Find "postgresql-x64-15" and start it
```

### Prisma Client Errors
```
Error: @prisma/client did not initialize yet
```
**Solution:** Regenerate Prisma client
```bash
npm run db:generate
```

### Port 3000 Already in Use
```
Error: Address already in use
```
**Solution:** Use different port
```bash
npm run dev -- -p 3001
```

---

## Production Deployment (Local Hospital Server)

### 1. Build Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Run as Windows Service (Optional)
Use [NSSM](https://nssm.cc/) to run as service:
```bash
nssm install MCUTrack "C:\Program Files\nodejs\node.exe" "C:\path\to\MCUTrack\node_modules\next\dist\bin\next" start
nssm start MCUTrack
```

### 4. Backup Database
```bash
# Daily backup script
pg_dump -U mcustrack_user mcustrack > backup_%date%.sql
```

---

## Project Structure

```
MCUTrack/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Initial data
├── src/
│   ├── app/             # Next.js pages
│   ├── actions/         # Server actions
│   ├── lib/             # Utilities
│   └── components/      # React components
├── .env                 # Environment variables
└── package.json
```

---

## Support

For issues or questions, check:
- `ARCHITECTURE.md` - System design
- `ROLES.md` - User roles explanation
- `SECURITY.md` - Security practices
- `MVP_SCOPE.md` - Feature scope
