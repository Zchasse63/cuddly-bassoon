-- Phase 2: Row Level Security Policies

-- ============================================================================
-- 9. ENABLE RLS ON ALL TABLES
-- ============================================================================

-- User-owned tables (require RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Public/cached data tables (enable RLS but with permissive policies)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9.2 RLS POLICIES
-- ============================================================================

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Preferences: Users can only access their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- Saved Searches: Users can only access their own saved searches
CREATE POLICY "Users can view own saved searches" ON saved_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- Buyers: Users can only access their own buyers
CREATE POLICY "Users can view own buyers" ON buyers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own buyers" ON buyers FOR ALL USING (auth.uid() = user_id);

-- Buyer Preferences: Access through buyer ownership
CREATE POLICY "Users can view buyer preferences" ON buyer_preferences FOR SELECT 
    USING (EXISTS (SELECT 1 FROM buyers WHERE buyers.id = buyer_preferences.buyer_id AND buyers.user_id = auth.uid()));
CREATE POLICY "Users can manage buyer preferences" ON buyer_preferences FOR ALL 
    USING (EXISTS (SELECT 1 FROM buyers WHERE buyers.id = buyer_preferences.buyer_id AND buyers.user_id = auth.uid()));

-- Buyer Transactions: Access through buyer ownership
CREATE POLICY "Users can view buyer transactions" ON buyer_transactions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM buyers WHERE buyers.id = buyer_transactions.buyer_id AND buyers.user_id = auth.uid()));
CREATE POLICY "Users can manage buyer transactions" ON buyer_transactions FOR ALL 
    USING (EXISTS (SELECT 1 FROM buyers WHERE buyers.id = buyer_transactions.buyer_id AND buyers.user_id = auth.uid()));

-- Deals: Users can only access their own deals
CREATE POLICY "Users can view own deals" ON deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own deals" ON deals FOR ALL USING (auth.uid() = user_id);

-- Deal Activities: Access through deal ownership
CREATE POLICY "Users can view deal activities" ON deal_activities FOR SELECT 
    USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_activities.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can manage deal activities" ON deal_activities FOR ALL 
    USING (auth.uid() = user_id);

-- Offers: Access through deal ownership
CREATE POLICY "Users can view offers" ON offers FOR SELECT 
    USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = offers.deal_id AND deals.user_id = auth.uid()));
CREATE POLICY "Users can manage offers" ON offers FOR ALL 
    USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = offers.deal_id AND deals.user_id = auth.uid()));

-- Messages: Users can only access their own messages
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own messages" ON messages FOR ALL USING (auth.uid() = user_id);

-- Templates: Users can only access their own templates
CREATE POLICY "Users can view own templates" ON templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own templates" ON templates FOR ALL USING (auth.uid() = user_id);

-- Properties: Publicly readable (cached data)
CREATE POLICY "Properties are publicly readable" ON properties FOR SELECT USING (true);

-- Valuations: Publicly readable (cached data)
CREATE POLICY "Valuations are publicly readable" ON valuations FOR SELECT USING (true);

-- Market Data: Publicly readable
CREATE POLICY "Market data is publicly readable" ON market_data FOR SELECT USING (true);

-- Listings: Publicly readable
CREATE POLICY "Listings are publicly readable" ON listings FOR SELECT USING (true);

-- Documents: Publicly readable (knowledge base)
CREATE POLICY "Documents are publicly readable" ON documents FOR SELECT USING (is_active = true);

-- Document Chunks: Publicly readable
CREATE POLICY "Document chunks are publicly readable" ON document_chunks FOR SELECT 
    USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_chunks.document_id AND documents.is_active = true));

-- Embeddings: Publicly readable (for semantic search)
CREATE POLICY "Embeddings are publicly readable" ON embeddings FOR SELECT USING (true);

