-- ═══════════════════════════════════════════════════════════════════
--  ChatterBox — PostgreSQL Database Setup Script
--  Run this in pgAdmin Query Tool or SQL Shell (psql) as postgres superuser
-- ═══════════════════════════════════════════════════════════════════

-- 1. Create the database
CREATE DATABASE chatapp;

-- 2. (Optional) Create a dedicated application user
--    Uncomment and change 'your_password' if you want a separate DB user
-- CREATE USER chatuser WITH PASSWORD 'your_password';
-- GRANT ALL PRIVILEGES ON DATABASE chatapp TO chatuser;

-- ───────────────────────────────────────────────────────────────────
-- NOTE: The tables below are created AUTOMATICALLY by Hibernate
--       on the first startup. You do NOT need to run them manually.
--       They are provided here for reference only.
-- ───────────────────────────────────────────────────────────────────

-- Switch to the chatapp database first (\c chatapp in psql)

-- users table
CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL PRIMARY KEY,
    username         VARCHAR(255) NOT NULL UNIQUE,
    password         TEXT        NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    full_name        VARCHAR(255),
    profile_picture  TEXT,
    role             VARCHAR(50)  DEFAULT 'USER',
    online           BOOLEAN      DEFAULT FALSE
);

-- messages table
CREATE TABLE IF NOT EXISTS messages (
    id           BIGSERIAL PRIMARY KEY,
    content      TEXT,
    timestamp    TIMESTAMP,
    sender_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    recipient_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status       VARCHAR(50) DEFAULT 'SENT'
);

-- Indexes for fast message lookups
CREATE INDEX IF NOT EXISTS idx_messages_sender    ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);

-- ───────────────────────────────────────────────────────────────────
-- Sample data (optional — remove if not needed)
-- ───────────────────────────────────────────────────────────────────

-- These are BCrypt-hashed versions of "Password123"
-- INSERT INTO users (username, password, email, full_name, role, online) VALUES
--   ('alice', '$2a$10$N4Zr.oY.rGBR4tV1Jw6e3ueqkKHfAW5Dz/gBc2Xk6X4O8P1c5PsS', 'alice@example.com', 'Alice Smith', 'USER', false),
--   ('bob',   '$2a$10$N4Zr.oY.rGBR4tV1Jw6e3ueqkKHfAW5Dz/gBc2Xk6X4O8P1c5PsS', 'bob@example.com',   'Bob Jones',  'USER', false);
