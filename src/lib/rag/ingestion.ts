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

/**
 * Validates that a file path entry name is safe (no path separators or traversal).
 */
function validateEntryName(name: string): boolean {
  // Reject names with path separators or parent directory references
  return (
    !name.includes(path.sep) &&
    !name.includes('/') &&
    !name.includes('\\') &&
    name !== '..' &&
    name !== '.'
  );
}

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

  // Resolve and validate the base path
  const resolvedBasePath = path.resolve(knowledgeBasePath);

  // Ensure the path exists and is a directory
  if (!fs.existsSync(resolvedBasePath) || !fs.statSync(resolvedBasePath).isDirectory()) {
    throw new Error(`Invalid knowledge base path: ${knowledgeBasePath}`);
  }

  // Find all markdown files (findMarkdownFiles will enforce base directory constraints)
  const files = findMarkdownFiles(resolvedBasePath);
  const totalFiles = files.length;

  onProgress?.({
    phase: 'reading',
    current: 0,
    total: totalFiles,
    message: `Found ${totalFiles} documents`,
  });

  const supabase = getSupabaseClient();

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    if (!filePath) continue;
    const fileName = path.relative(resolvedBasePath, filePath);

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
      onProgress?.({
        phase: 'embedding',
        current: i + 1,
        total: totalFiles,
        currentFile: fileName,
      });
      const chunkContents = chunks.map((c) => c.content);
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
  onProgress?.({
    phase: 'complete',
    current: totalFiles,
    total: totalFiles,
    message: 'Ingestion complete',
  });

  return {
    success: errors.length === 0,
    documentsProcessed,
    chunksCreated,
    embeddingsGenerated,
    errors,
    duration,
  };
}

function findMarkdownFiles(dir: string, baseDir?: string): string[] {
  // Use provided base or initialize with the starting directory
  const effectiveBase = baseDir ?? path.resolve(dir);
  const files: string[] = [];

  // Validate that dir is within base directory
  const resolvedDir = path.resolve(dir);
  if (!resolvedDir.startsWith(effectiveBase + path.sep) && resolvedDir !== effectiveBase) {
    throw new Error(`Path traversal detected: directory escapes base`);
  }

  const entries = fs.readdirSync(resolvedDir, { withFileTypes: true });

  for (const entry of entries) {
    // Validate entry name to prevent path traversal via malicious filenames
    if (!validateEntryName(entry.name)) {
      continue; // Skip entries with unsafe names
    }

    const fullPath = path.join(resolvedDir, entry.name);

    // Double-check the joined path is still within base
    if (!fullPath.startsWith(effectiveBase + path.sep) && fullPath !== effectiveBase) {
      continue; // Skip paths that escape the base directory
    }

    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, effectiveBase));
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
    .upsert(
      {
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
      },
      { onConflict: 'slug' }
    )
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
