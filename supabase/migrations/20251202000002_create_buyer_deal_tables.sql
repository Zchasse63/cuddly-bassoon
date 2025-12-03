-- Phase 2: Buyer and Deal Pipeline Tables

-- ============================================================================
-- 4. BUYER TABLES
-- ============================================================================

-- 4.1 Buyers Table
CREATE TABLE buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    buyer_type VARCHAR(50) CHECK (buyer_type IN ('flipper', 'landlord', 'wholesaler', 'developer', 'other')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'qualified', 'unqualified')),
    tier VARCHAR(1) CHECK (tier IN ('A', 'B', 'C')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Buyer Preferences Table
CREATE TABLE buyer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    property_types JSONB DEFAULT '[]'::JSONB,
    price_range_min DECIMAL(15, 2),
    price_range_max DECIMAL(15, 2),
    bedroom_min INTEGER,
    bedroom_max INTEGER,
    markets JSONB DEFAULT '[]'::JSONB,
    condition_tolerance VARCHAR(50) CHECK (condition_tolerance IN ('turnkey', 'light_rehab', 'moderate_rehab', 'heavy_rehab', 'gut')),
    max_rehab_budget DECIMAL(15, 2),
    preferred_roi_percent DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id)
);

-- 4.3 Buyer Transactions Table
CREATE TABLE buyer_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    property_address VARCHAR(500),
    purchase_price DECIMAL(15, 2),
    sale_price DECIMAL(15, 2),
    purchase_date DATE,
    sale_date DATE,
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('purchase', 'sale')),
    data_source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. DEAL PIPELINE TABLES
-- ============================================================================

-- 5.1 Deals Table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    property_address VARCHAR(500) NOT NULL,
    stage VARCHAR(50) DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'offer', 'contract', 'closing', 'closed', 'lost')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'cancelled', 'completed')),
    seller_name VARCHAR(255),
    seller_phone VARCHAR(50),
    seller_email VARCHAR(255),
    asking_price DECIMAL(15, 2),
    offer_price DECIMAL(15, 2),
    contract_price DECIMAL(15, 2),
    assignment_fee DECIMAL(15, 2),
    estimated_arv DECIMAL(15, 2),
    estimated_repairs DECIMAL(15, 2),
    assigned_buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 Deal Activities Table
CREATE TABLE deal_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('call', 'email', 'sms', 'note', 'stage_change', 'meeting', 'other')),
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3 Offers Table
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    offer_amount DECIMAL(15, 2) NOT NULL,
    offer_date DATE NOT NULL,
    expiration_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired', 'withdrawn')),
    counter_amount DECIMAL(15, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

