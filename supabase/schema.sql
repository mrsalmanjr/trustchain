-- TrustChain Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('donor', 'ngo', 'admin')) NOT NULL,
    password_hash TEXT NOT NULL, -- In a real app, use Supabase Auth. For this migration, we store the hash.
    phone TEXT,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    preferred_category TEXT,
    notification_preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NGOs Table
CREATE TABLE ngos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ngo_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    description TEXT,
    verified TEXT CHECK (verified IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    documents JSONB DEFAULT '[]'::jsonb,
    logo TEXT,
    bank_account TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns Table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
    ngo_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    goal_amount NUMERIC NOT NULL,
    raised_amount NUMERIC DEFAULT 0,
    beneficiary_count INTEGER DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    banner_image TEXT,
    supporting_documents JSONB DEFAULT '[]'::jsonb,
    status TEXT CHECK (status IN ('pending', 'active', 'completed', 'paused')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Updates Table
CREATE TABLE campaign_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utilization Reports Table
CREATE TABLE utilization_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount_used NUMERIC NOT NULL,
    recipient_name TEXT NOT NULL,
    supporting_invoice_url TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations Table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    campaign_title TEXT NOT NULL,
    donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
    ngo_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    blockchain_hash TEXT DEFAULT 'PENDING_RECORD',
    status TEXT CHECK (status IN ('initiated', 'paid', 'transferred', 'utilized', 'hashed')) DEFAULT 'initiated',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Initial Seed Data (Admin User)
-- INSERT INTO users (id, email, name, role, password_hash) VALUES ('00000000-0000-0000-0000-000000000001', 'admin@trustchain.org', 'TrustChain Administrator', 'admin', 'admin123');
