-- ==========================================================
-- SMART COLD STORAGE: DATABASE SCHEMA
-- PostgreSQL DDL for Users, OTP Authentication & Notification System
-- ==========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- 1. Registered Farmers / Users Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    farm_name VARCHAR(128) NOT NULL,
    cold_storage_id VARCHAR(32) NOT NULL,
    location VARCHAR(128) NOT NULL,
    total_capacity_kg NUMERIC NOT NULL DEFAULT 500,
    language VARCHAR(16) NOT NULL DEFAULT 'en',
    temp_unit VARCHAR(8) NOT NULL DEFAULT '°C',
    weight_unit VARCHAR(16) NOT NULL DEFAULT 'kg',
    role VARCHAR(32) NOT NULL DEFAULT 'FARMER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users (mobile);

-- Seed Registered Farmers
INSERT INTO users (id, name, mobile, farm_name, cold_storage_id, location, total_capacity_kg, language)
VALUES
('usr-1', 'Ramesh Patel (रमेश पटेल)', '9876543210', 'Patel Agro Farms (ग्रीन वैली फार्म्स)', 'SC-001', 'Nashik, Maharashtra', 500, 'en'),
('usr-2', 'Suresh Kumar (सुरेश कुमार)', '9812345678', 'Kisan Golden Harvest (किसान फार्म)', 'SC-002', 'Pune, Maharashtra', 750, 'hi'),
('usr-3', 'Anita Devi (अनिता देवी)', '9823456789', 'Devi Organic Produce (जैविक फार्म)', 'SC-003', 'Baramati, Maharashtra', 600, 'hinglish'),
('usr-4', 'Rajesh Patil (राजेश पाटिल)', '9988776655', 'Patil Cold Chain Units (पाटिल फार्म)', 'SC-004', 'Nagpur, Maharashtra', 1000, 'en')
ON CONFLICT (id) DO UPDATE SET mobile = EXCLUDED.mobile;

-- ----------------------------------------------------------
-- 2. OTP Verifications Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NULL REFERENCES users(id) ON DELETE SET NULL,
    phone_number VARCHAR(15) NOT NULL,
    otp_hash VARCHAR(256) NOT NULL,
    purpose VARCHAR(32) NOT NULL DEFAULT 'LOGIN', -- 'LOGIN', 'PHONE_VERIFY', 'SECURITY'
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    verified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-performance lookup & rate-limiting queries
CREATE INDEX IF NOT EXISTS idx_otp_phone_expires ON otp_verifications (phone_number, expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_created_at ON otp_verifications (created_at DESC);

-- ----------------------------------------------------------
-- 3. Alert & Notification System Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL DEFAULT 'usr-1' REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NULL,
    message TEXT NOT NULL,
    message_hi TEXT NULL,
    type VARCHAR(32) NOT NULL, -- 'TEMPERATURE', 'HUMIDITY', 'BATTERY', 'SOLAR', 'STORAGE', 'INVENTORY', 'SECURITY', 'SYSTEM', 'OTP'
    priority VARCHAR(16) NOT NULL DEFAULT 'INFO', -- 'HIGH', 'MEDIUM', 'LOW', 'INFO'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ NULL,
    metadata JSONB NULL,
    action_url VARCHAR(255) NULL
);

-- Indexes for lightning-fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications (priority);

-- Initial Seed Notifications
INSERT INTO notifications (id, user_id, title, title_hi, message, message_hi, type, priority, is_read, created_at, metadata)
VALUES
(
    'notif-seed-1',
    'usr-1',
    'Temperature Exceeded Safe Threshold',
    'तापमान सुरक्षित सीमा से अधिक हुआ',
    'Storage Compartment A reached 5.8°C (Safe limit: 0.5°C - 5.5°C). Secondary cooling active.',
    'कम्पार्टमेंट A का तापमान 5.8°C पहुँचा। अतिरिक्त कूलिंग शुरू की गई।',
    'TEMPERATURE',
    'HIGH',
    false,
    NOW() - INTERVAL '5 minutes',
    '{"temp": 5.8, "threshold": 5.5, "chamber": "A"}'::jsonb
),
(
    'notif-seed-2',
    'usr-1',
    'Battery Reserve Below 30%',
    'बैटरी बैकअप 30% से नीचे',
    'LiFePO4 Storage Battery is at 28%. Hybrid solar/wind priority charging initiated.',
    'LiFePO4 बैटरी 28% पर है। हाइब्रिड सौर/पवन चार्जिंग सक्रिय।',
    'BATTERY',
    'MEDIUM',
    false,
    NOW() - INTERVAL '20 minutes',
    '{"batteryLevel": 28}'::jsonb
),
(
    'notif-seed-3',
    'usr-1',
    'VAWT Wind Turbine Generation High',
    'पवन चक्की से बिजली उत्पादन तेज',
    'Wind speed 14.2 km/h detected. Generator delivering 4.8 kW clean power to compressor.',
    'हवा की गति 14.2 km/h। 4.8 kW स्वच्छ ऊर्जा कम्प्रेसर को मिल रही है।',
    'SOLAR',
    'LOW',
    true,
    NOW() - INTERVAL '1 hour',
    '{"windSpeed": 14.2, "generationKw": 4.8}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
