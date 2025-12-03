-- Phase 2: RPC Functions for Complex Queries

-- ============================================================================
-- 10. RPC FUNCTIONS
-- ============================================================================

-- 10.1 Semantic Search Function (match_documents)
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_count INTEGER DEFAULT 10,
    similarity_threshold FLOAT DEFAULT 0.7,
    filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    chunk_content TEXT,
    document_title TEXT,
    document_slug TEXT,
    category TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        d.id AS document_id,
        dc.content AS chunk_content,
        d.title AS document_title,
        d.slug AS document_slug,
        d.category,
        1 - (e.embedding <=> query_embedding) AS similarity
    FROM embeddings e
    JOIN document_chunks dc ON e.chunk_id = dc.id
    JOIN documents d ON dc.document_id = d.id
    WHERE d.is_active = true
        AND (filter_category IS NULL OR d.category = filter_category)
        AND 1 - (e.embedding <=> query_embedding) >= similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 10.2 Property Search Function
CREATE OR REPLACE FUNCTION search_properties(
    p_zip TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_property_type TEXT DEFAULT NULL,
    p_min_bedrooms INTEGER DEFAULT NULL,
    p_max_bedrooms INTEGER DEFAULT NULL,
    p_min_bathrooms NUMERIC DEFAULT NULL,
    p_max_bathrooms NUMERIC DEFAULT NULL,
    p_min_sqft INTEGER DEFAULT NULL,
    p_max_sqft INTEGER DEFAULT NULL,
    p_min_year_built INTEGER DEFAULT NULL,
    p_max_year_built INTEGER DEFAULT NULL,
    p_owner_type TEXT DEFAULT NULL,
    p_is_listed BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    address VARCHAR,
    city VARCHAR,
    state VARCHAR,
    zip VARCHAR,
    property_type VARCHAR,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    square_footage INTEGER,
    year_built INTEGER,
    owner_type VARCHAR,
    is_listed BOOLEAN,
    estimated_value NUMERIC,
    rent_estimate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.address,
        p.city,
        p.state,
        p.zip,
        p.property_type,
        p.bedrooms,
        p.bathrooms,
        p.square_footage,
        p.year_built,
        p.owner_type,
        p.is_listed,
        v.estimated_value,
        v.rent_estimate
    FROM properties p
    LEFT JOIN LATERAL (
        SELECT val.estimated_value, val.rent_estimate
        FROM valuations val
        WHERE val.property_id = p.id
        ORDER BY val.valuation_date DESC
        LIMIT 1
    ) v ON true
    WHERE 
        (p_zip IS NULL OR p.zip = p_zip)
        AND (p_city IS NULL OR p.city ILIKE '%' || p_city || '%')
        AND (p_state IS NULL OR p.state = p_state)
        AND (p_property_type IS NULL OR p.property_type = p_property_type)
        AND (p_min_bedrooms IS NULL OR p.bedrooms >= p_min_bedrooms)
        AND (p_max_bedrooms IS NULL OR p.bedrooms <= p_max_bedrooms)
        AND (p_min_bathrooms IS NULL OR p.bathrooms >= p_min_bathrooms)
        AND (p_max_bathrooms IS NULL OR p.bathrooms <= p_max_bathrooms)
        AND (p_min_sqft IS NULL OR p.square_footage >= p_min_sqft)
        AND (p_max_sqft IS NULL OR p.square_footage <= p_max_sqft)
        AND (p_min_year_built IS NULL OR p.year_built >= p_min_year_built)
        AND (p_max_year_built IS NULL OR p.year_built <= p_max_year_built)
        AND (p_owner_type IS NULL OR p.owner_type = p_owner_type)
        AND (p_is_listed IS NULL OR p.is_listed = p_is_listed)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

