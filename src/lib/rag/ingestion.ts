/**
 * Document Ingestion Service
 * Handles reading, processing, chunking, and storing documents with embeddings
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parseDocument, type ProcessedDocument } from './document-processor';
import { chunkDocument, type DocumentChunk } from './chunker';
import { generateBatchEmbeddings, formatEmbeddingForPgVector, EMBEDDING_MODEL } from './embedder';
import type { Database } from '@/types/database';

export interface IngestionProgress {
  phase: 'reading' | 'processing' | 'chunking' | 'embedding' | 'storing' | 'complete';
  current: number;
  total: number;
  currentFile?: string;
  message?: string;
}

export interface IngestionResult {
  success: boolean;
  documentsProcessed: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  errors: Array<{ file: string; error: string }>;
  duration: number;
}

type ProgressCallback = (progress: IngestionProgress) => void;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient<Database>(url, key);
}

/**
 * Ingest all documents from the knowledge base directory
 */
export async function ingestAllDocuments(
  knowledgeBasePath: string,
  onProgress?: ProgressCallback
): Promise<IngestionResult> {
  const startTime = Date.now();
  const errors: Array<{ file: string; error: string }> = [];
  let documentsProcessed = 0;
  let chunksCreated = 0;
  let embeddingsGenerated = 0;

  // Find all markdown files
  const files = findMarkdownFiles(knowledgeBasePath);
  const totalFiles = files.length;

  onProgress?.({ phase: 'reading', current: 0, total: totalFiles, message: `Found ${totalFiles} documents` });

  const supabase = getSupabaseClient();

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    if (!filePath) continue;
    const fileName = path.relative(knowledgeBasePath, filePath);

    onProgress?.({ phase: 'processing', current: i + 1, total: totalFiles, currentFile: fileName });

    try {
      // Read and parse document
      const content = fs.readFileSync(filePath, 'utf-8');
      const result = parseDocument(content, filePath);

      if (!result.success || !result.document) {
        errors.push({ file: fileName, error: result.error || 'Unknown error' });
        continue;
      }

      const doc = result.document;

      // Store document in database
      const docId = await storeDocument(supabase, doc);
      documentsProcessed++;

      // Chunk the document
      onProgress?.({ phase: 'chunking', current: i + 1, total: totalFiles, currentFile: fileName });
      const chunks = chunkDocument(doc.content);

      // Store chunks
      const chunkIds = await storeChunks(supabase, docId, chunks);
      chunksCreated += chunkIds.length;

      // Generate embeddings
      onProgress?.({ phase: 'embedding', current: i + 1, total: totalFiles, currentFile: fileName });
      const chunkContents = chunks.map(c => c.content);
      const embeddingResults = await generateBatchEmbeddings(chunkContents, (completed, total) => {
        onProgress?.({
          phase: 'embedding',
          current: i + 1,
          total: totalFiles,
          currentFile: fileName,
          message: `Embedding ${completed}/${total} chunks`,
        });
      });

      // Store embeddings
      onProgress?.({ phase: 'storing', current: i + 1, total: totalFiles, currentFile: fileName });
      for (let j = 0; j < chunkIds.length; j++) {
        const chunkId = chunkIds[j];
        const embeddingResult = embeddingResults.embeddings[j];
        if (chunkId && embeddingResult && embeddingResult.embedding.length > 0) {
          await storeEmbedding(supabase, chunkId, embeddingResult.embedding);
          embeddingsGenerated++;
        }
      }
    } catch (error) {
      errors.push({
        file: fileName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const duration = Date.now() - startTime;
  onProgress?.({ phase: 'complete', current: totalFiles, total: totalFiles, message: 'Ingestion complete' });

  return {
    success: errors.length === 0,
    documentsProcessed,
    chunksCreated,
    embeddingsGenerated,
    errors,
    duration,
  };
}

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function storeDocument(
  supabase: ReturnType<typeof getSupabaseClient>,
  doc: ProcessedDocument
): Promise<string> {
  const { data, error } = await supabase
    .from('documents')
    .upsert({
      slug: doc.metadata.slug,
      title: doc.metadata.title,
      category: doc.metadata.category,
      subcategory: doc.metadata.subcategory,
      content: doc.content,
      tags: doc.metadata.tags,
      related_docs: doc.metadata.related_docs,
      difficulty_level: doc.metadata.difficulty_level,
      version: doc.metadata.version ? parseFloat(doc.metadata.version) : 1.0,
      is_active: true,
    }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to store document: ${error.message}`);
  return data.id;
}

async function storeChunks(
  supabase: ReturnType<typeof getSupabaseClient>,
  documentId: string,
  chunks: DocumentChunk[]
): Promise<string[]> {
  // First delete existing chunks for this document
  await supabase.from('document_chunks').delete().eq('document_id', documentId);

  const chunkIds: string[] = [];

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from('document_chunks')
      .insert({
        document_id: documentId,
        chunk_index: chunk.metadata.chunkIndex,
        content: chunk.content,
        token_count: chunk.metadata.tokenCount,
        metadata: { sectionHeaders: chunk.metadata.sectionHeaders },
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to store chunk: ${error.message}`);
    chunkIds.push(data.id);
  }

  return chunkIds;
}

async function storeEmbedding(
  supabase: ReturnType<typeof getSupabaseClient>,
  chunkId: string,
  embedding: number[]
): Promise<void> {
  // Delete existing embedding for this chunk
  await supabase.from('embeddings').delete().eq('chunk_id', chunkId);

  const { error } = await supabase.from('embeddings').insert({
    chunk_id: chunkId,
    embedding: formatEmbeddingForPgVector(embedding),
    model_version: EMBEDDING_MODEL,
  });

  if (error) throw new Error(`Failed to store embedding: ${error.message}`);
}

/**
 * Ingest a single document file
 */
export async function ingestSingleDocument(filePath: string): Promise<IngestionResult> {
  return ingestAllDocuments(path.dirname(filePath), undefined);
}
