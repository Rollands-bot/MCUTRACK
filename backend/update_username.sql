-- Update existing users dengan username dari email
UPDATE users SET username = SPLIT_PART(email, '@', 1) WHERE username IS NULL OR username = '';

-- Atau kalau mau reset total, drop dan recreate:
-- DROP TABLE IF EXISTS users CASCADE;
-- Lalu jalankan seed ulang
