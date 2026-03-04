# MCUTrack Setup Script for Windows
# This script helps setup the Go backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MCUTrack Backend Setup (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Go is installed
Write-Host "Checking Go installation..." -ForegroundColor Yellow
$goVersion = Get-Command go -ErrorAction SilentlyContinue

if ($null -eq $goVersion) {
    Write-Host "Go is NOT installed on your system!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Go from: https://go.dev/dl/" -ForegroundColor Yellow
    Write-Host "After installation, restart your terminal and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick steps:" -ForegroundColor Cyan
    Write-Host "1. Download Go installer from https://go.dev/dl/" -ForegroundColor White
    Write-Host "2. Run the installer (go1.xx.x.windows-amd64.msi)" -ForegroundColor White
    Write-Host "3. Click Next through the installation wizard" -ForegroundColor White
    Write-Host "4. Restart your terminal/PowerShell" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
} else {
    Write-Host "Go is installed: $($goVersion.Version)" -ForegroundColor Green
}

# Navigate to backend directory
Write-Host ""
Write-Host "Setting up backend..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"

# Download dependencies
Write-Host ""
Write-Host "Downloading Go dependencies..." -ForegroundColor Yellow
go mod download

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to download dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies downloaded successfully!" -ForegroundColor Green

# Check if .env exists
Write-Host ""
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ".env file created! Please edit it with your configuration." -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit backend\.env and update:" -ForegroundColor Red
    Write-Host "  - DATABASE_URL (your PostgreSQL connection string)" -ForegroundColor White
    Write-Host "  - JWT_SECRET (generate a random string)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

# Ask user if they want to seed the database
Write-Host ""
Write-Host "Do you want to seed the database now? (y/n)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Seeding database..." -ForegroundColor Yellow
    go run cmd/seed/main.go
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database seeded successfully!" -ForegroundColor Green
    } else {
        Write-Host "Database seeding failed!" -ForegroundColor Red
        Write-Host "Make sure PostgreSQL is running and DATABASE_URL is correct in .env" -ForegroundColor Yellow
    }
}

# Return to project root
Set-Location -Path "$PSScriptRoot"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend\.env with your database credentials" -ForegroundColor White
Write-Host "2. Run 'npm install' to install concurrently" -ForegroundColor White
Write-Host "3. Run 'npm run dev:all' to start both servers" -ForegroundColor White
Write-Host ""
Write-Host "Or run backend separately:" -ForegroundColor Yellow
Write-Host "  npm run dev:backend" -ForegroundColor White
Write-Host ""
