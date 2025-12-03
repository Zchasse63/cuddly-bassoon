-- Phase 2: Indexes for Performance

-- ============================================================================
-- 8. STRATEGIC INDEXES
-- ============================================================================

-- 8.1 Properties Indexes
CREATE INDEX idx_properties_rentcast_id ON properties(rentcast_id);
CREATE INDEX idx_properties_zip ON properties(zip);
CREATE INDEX idx_properties_owner_type ON properties(owner_type);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_city_state ON properties(city, state);
CREATE INDEX idx_properties_address_gin ON properties USING GIN(address gin_trgm_ops);

-- 8.2 Valuations Indexes
CREATE INDEX idx_valuations_property_id ON valuations(property_id);

-- 8.3 Market Data Indexes
CREATE INDEX idx_market_data_zip_code ON market_data(zip_code);
CREATE INDEX idx_market_data_city_state ON market_data(city, state);

-- 8.4 Listings Indexes
CREATE INDEX idx_listings_property_id ON listings(property_id);
CREATE INDEX idx_listings_mls_number ON listings(mls_number);
CREATE INDEX idx_listings_status ON listings(listing_status);

-- 8.5 User Tables Indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);

-- 8.6 Buyer Tables Indexes
CREATE INDEX idx_buyers_user_id ON buyers(user_id);
CREATE INDEX idx_buyers_status ON buyers(status);
CREATE INDEX idx_buyers_tier ON buyers(tier);
CREATE INDEX idx_buyer_preferences_buyer_id ON buyer_preferences(buyer_id);
CREATE INDEX idx_buyer_transactions_buyer_id ON buyer_transactions(buyer_id);

-- 8.7 Deal Tables Indexes
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_assigned_buyer ON deals(assigned_buyer_id);
CREATE INDEX idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX idx_deal_activities_user_id ON deal_activities(user_id);
CREATE INDEX idx_offers_deal_id ON offers(deal_id);
CREATE INDEX idx_offers_status ON offers(status);

-- 8.8 Knowledge Base Indexes
CREATE INDEX idx_documents_slug ON documents(slug);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_is_active ON documents(is_active);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_embeddings_chunk_id ON embeddings(chunk_id);

-- HNSW Index for vector similarity search (pgvector)
CREATE INDEX idx_embeddings_vector ON embeddings USING hnsw (embedding vector_cosine_ops);

-- 8.9 Communication Indexes
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_deal_id ON messages(deal_id);
CREATE INDEX idx_messages_buyer_id ON messages(buyer_id);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_channel ON templates(channel);

-- ============================================================================
-- 8.2 COMPOSITE INDEXES
-- ============================================================================

-- Properties composite indexes
CREATE INDEX idx_properties_zip_type ON properties(zip, property_type);
CREATE INDEX idx_properties_state_city ON properties(state, city);

-- Deals composite indexes
CREATE INDEX idx_deals_user_stage_status ON deals(user_id, stage, status);
CREATE INDEX idx_deals_user_created ON deals(user_id, created_at DESC);

-- Messages composite indexes
CREATE INDEX idx_messages_user_channel_created ON messages(user_id, channel, created_at DESC);
CREATE INDEX idx_messages_deal_created ON messages(deal_id, created_at DESC);

-- Buyers composite indexes
CREATE INDEX idx_buyers_user_status_tier ON buyers(user_id, status, tier);

