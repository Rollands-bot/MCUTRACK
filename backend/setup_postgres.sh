#!/bin/bash
# Script untuk setup database MCUTrack
# Jalankan dengan: bash setup_postgres.sh

echo "=== MCUTrack PostgreSQL Setup ==="
echo ""

# Cek apakah script dijalankan dengan sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Error: Jalankan script ini dengan sudo"
    echo "Usage: sudo bash setup_postgres.sh"
    exit 1
fi

# Buat database
echo "Creating database mcutrack..."
su - postgres -c "psql -c 'CREATE DATABASE mcutrack;'" 2>/dev/null || echo "Database might already exist"

# Set password
echo "Setting password for postgres user..."
su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD 'Way14045.';\""

# Grant privileges
echo "Granting privileges..."
su - postgres -c "psql -c 'GRANT ALL PRIVILEGES ON DATABASE mcutrack TO postgres;'"

echo ""
echo "=== Setup completed! ==="
echo ""
echo "Now you can run the backend:"
echo "  cd backend && source ~/.profile && ./mcutrack-api &"
