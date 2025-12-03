-- Phase 2: Database Schema Migration
-- Create core tables for RE AI Wholesaling Platform

-- ============================================================================
-- 1. EXTENSIONS (verify enabled)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA extensions;

-- ============================================================================
-- 2. CORE PROPERTY TABLES
-- ============================================================================

-- 2.1 Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rentcast_id VARCHAR(100) UNIQUE,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    county VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type VARCHAR(50),
    bedrooms INTEGER,
    bathrooms DECIMAL(4, 2),
    square_footage INTEGER,
    lot_size INTEGER,
    year_built INTEGER,
    owner_name VARCHAR(255),
    owner_type VARCHAR(50),
    ownership_length_months INTEGER,
    is_listed BOOLEAN DEFAULT FALSE,
    listing_status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Valuations Table
CREATE TABLE valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    estimated_value DECIMAL(15, 2),
    price_range_low DECIMAL(15, 2),
    price_range_high DECIMAL(15, 2),
    rent_estimate DECIMAL(10, 2),
    rent_range_low DECIMAL(10, 2),
    rent_range_high DECIMAL(10, 2),
    arv_estimate DECIMAL(15, 2),
    equity_percent DECIMAL(5, 2),
    equity_amount DECIMAL(15, 2),
    valuation_date DATE,
    data_source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Market Data Table
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zip_code VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    county VARCHAR(100),
    median_home_value DECIMAL(15, 2),
    median_rent DECIMAL(10, 2),
    price_per_sqft DECIMAL(10, 2),
    rent_per_sqft DECIMAL(10, 2),
    days_on_market_avg INTEGER,
    inventory_count INTEGER,
    absorption_rate DECIMAL(5, 2),
    year_over_year_change DECIMAL(5, 2),
    data_date DATE,
    data_source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Listings Table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    mls_number VARCHAR(50),
    listing_status VARCHAR(50),
    list_price DECIMAL(15, 2),
    original_list_price DECIMAL(15, 2),
    price_changes JSONB DEFAULT '[]'::JSONB,
    days_on_market INTEGER,
    listing_date DATE,
    expiration_date DATE,
    listing_agent VARCHAR(255),
    listing_office VARCHAR(255),
    photos JSONB DEFAULT '[]'::JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. USER TABLES
-- ============================================================================

-- 3.1 User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(50),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active',
    api_calls_remaining INTEGER DEFAULT 1000,
    api_calls_reset_date DATE,
    preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 User Preferences Table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    default_markets JSONB DEFAULT '[]'::JSONB,
    default_filters JSONB DEFAULT '{}'::JSONB,
    notification_settings JSONB DEFAULT '{}'::JSONB,
    ui_preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3.3 Saved Searches Table
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL DEFAULT '{}'::JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    notify_on_new BOOLEAN DEFAULT FALSE,
    last_run_at TIMESTAMPTZ,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

