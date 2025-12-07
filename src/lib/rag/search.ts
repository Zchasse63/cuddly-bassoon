/**
 * Semantic Search Service
 * Performs vector similarity search using pgvector
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, formatEmbeddingForPgVector } from './embedder';
import type { Database } from '@/types/database';

export interface SearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  metadata: {
    title: string;
    category: string;
    slug: string;
    subcategory?: string;
    tags?: string[];
    difficultyLevel?: string;
    sectionHeaders: string[];
    chunkIndex: number;
  };
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  categories?: string[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  excludeDocIds?: string[]; // Document IDs to exclude from results (for conversation context)
}

const DEFAULT_OPTIONS: Required<Omit<SearchOptions, 'difficultyLevel' | 'excludeDocIds'>> & { difficultyLevel?: string; excludeDocIds: string[] } = {
  limit: 5,
  threshold: 0.5,
  categories: [],
  difficultyLevel: undefined,
  excludeDocIds: [],
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient<Database>(url, key);
}

/**
 * Search for relevant document chunks using semantic similarity
 *
 * Search strategy:
 * 1. If categories provided: Run parallel searches per category using RPC filter_category
 * 2. Merge and deduplicate results by similarity
 * 3. Fallback: If filtered search returns < 2 results, also run unfiltered search
 *
 * This ensures we maximize recall while still prioritizing category-relevant results.
 */
export async function searchDocuments(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const supabase = getSupabaseClient();

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query);
  const embeddingStr = formatEmbeddingForPgVector(embedding);

  // Set of document IDs to exclude (for conversation context deduplication)
  const excludeSet = new Set(opts.excludeDocIds || []);

  const transformRow = (row: {
    id: string;
    document_id: string;
    chunk_content: string;
    similarity: number;
    document_title: string;
    category: string;
    document_slug: string;
  }): SearchResult => ({
    chunkId: row.id,
    documentId: row.document_id,
    content: row.chunk_content,
    similarity: row.similarity,
    metadata: {
      title: row.document_title,
      category: row.category,
      slug: row.document_slug,
      sectionHeaders: [],
      chunkIndex: 0,
    },
  });

  // Helper to check if a document should be excluded
  const shouldInclude = (docId: string): boolean => !excludeSet.has(docId);

  // Strategy: If categories specified, search each category then merge
  if (opts.categories.length > 0) {
    const categorySearches = opts.categories.map(category =>
      supabase.rpc('match_documents', {
        query_embedding: embeddingStr,
        similarity_threshold: opts.threshold,
        match_count: Math.ceil(opts.limit / opts.categories.length) + 2, // Extra buffer per category
        filter_category: category,
      })
    );

    // Also run unfiltered search as fallback (lower priority)
    const unfilteredSearch = supabase.rpc('match_documents', {
      query_embedding: embeddingStr,
      similarity_threshold: opts.threshold,
      match_count: opts.limit,
    });

    const [categoryResults, unfilteredResult] = await Promise.all([
      Promise.all(categorySearches),
      unfilteredSearch,
    ]);

    // Merge category results
    const seenChunks = new Set<string>();
    const mergedResults: SearchResult[] = [];

    // First: Add category-filtered results (higher priority)
    for (const result of categoryResults) {
      if (result.data) {
        for (const row of result.data) {
          if (!seenChunks.has(row.id) && shouldInclude(row.document_id)) {
            seenChunks.add(row.id);
            mergedResults.push(transformRow(row));
          }
        }
      }
    }

    // Second: If we have fewer than requested, add from unfiltered search
    if (mergedResults.length < opts.limit && unfilteredResult.data) {
      for (const row of unfilteredResult.data) {
        if (!seenChunks.has(row.id) && shouldInclude(row.document_id) && mergedResults.length < opts.limit) {
          seenChunks.add(row.id);
          mergedResults.push(transformRow(row));
        }
      }
    }

    // Sort by similarity and limit
    return mergedResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, opts.limit);
  }

  // No category filter: simple search
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embeddingStr,
    similarity_threshold: opts.threshold,
    match_count: opts.limit,
  });

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Filter out excluded documents and transform
  return data
    .filter(row => shouldInclude(row.document_id))
    .map(transformRow);
}

/**
 * Get related documents based on a document's content
 */
export async function getRelatedDocuments(
  documentId: string,
  limit = 3
): Promise<SearchResult[]> {
  const supabase = getSupabaseClient();

  // Get the document content
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('content, title')
    .eq('id', documentId)
    .single();

  if (docError || !doc) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Use the document title + first 500 chars as the query
  const query = `${doc.title}\n${doc.content.slice(0, 500)}`;
  
  // Search for similar documents, excluding the current one
  const results = await searchDocuments(query, { limit: limit + 1 });
  
  return results.filter(r => r.documentId !== documentId).slice(0, limit);
}

/**
 * Get a specific document by slug
 */
export async function getDocumentBySlug(slug: string): Promise<{
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
} | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content, category, tags')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category || 'general',
    tags: Array.isArray(data.tags) ? data.tags as string[] : [],
  };
}

