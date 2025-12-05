/**
 * Single file ingestion script
 * Usage: npx tsx scripts/ingest-single.ts <file-path>
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { parseDocument } from '../src/lib/rag/document-processor';
import { chunkDocument } from '../src/lib/rag/chunker';
import { generateBatchEmbeddings, formatEmbeddingForPgVector } from '../src/lib/rag/embedder';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Allowed base directory for ingestion (project root knowledge-base folder)
const ALLOWED_BASE_DIR = path.resolve(__dirname, '..', 'knowledge-base');

/**
 * Validates that a file path is within the allowed base directory.
 * Prevents path traversal attacks.
 */
function validateFilePath(inputPath: string): string {
  const resolvedPath = path.resolve(inputPath);

  // Ensure the resolved path is within the allowed base directory
  if (!resolvedPath.startsWith(ALLOWED_BASE_DIR + path.sep) && resolvedPath !== ALLOWED_BASE_DIR) {
    throw new Error(
      `Security error: Path "${inputPath}" is outside allowed directory. Files must be within ${ALLOWED_BASE_DIR}`
    );
  }

  // Ensure the file exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${inputPath}`);
  }

  return resolvedPath;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function ingestFile(filePath: string) {
  // Validate and resolve the file path before any file operations
  const validatedPath = validateFilePath(filePath);
  console.log('Processing:', validatedPath);
  const content = fs.readFileSync(validatedPath, 'utf-8');
  const result = parseDocument(content, filePath);

  if (!result.success || !result.document) {
    throw new Error(result.error || 'Failed to parse document');
  }

  const doc = result.document;
  console.log('  Title:', doc.metadata.title);

  // Insert document
  const { data: docData, error: docError } = await supabase
    .from('documents')
    .upsert(
      {
        slug: doc.metadata.slug,
        title: doc.metadata.title,
        content: doc.content,
        category: doc.metadata.category,
        tags: doc.metadata.tags,
        difficulty_level: doc.metadata.difficulty_level,
        related_docs: doc.metadata.related_docs,
        is_active: true,
      },
      { onConflict: 'slug' }
    )
    .select('id')
    .single();

  if (docError) throw new Error('Doc insert failed: ' + docError.message);
  console.log('  Document ID:', docData.id);

  // Delete existing chunks and embeddings for this document
  const { data: existingChunks } = await supabase
    .from('document_chunks')
    .select('id')
    .eq('document_id', docData.id);

  if (existingChunks && existingChunks.length > 0) {
    const chunkIds = existingChunks.map((c) => c.id);
    await supabase.from('embeddings').delete().in('chunk_id', chunkIds);
    await supabase.from('document_chunks').delete().eq('document_id', docData.id);
    console.log('  Deleted', existingChunks.length, 'existing chunks');
  }

  // Chunk
  const chunks = chunkDocument(doc.content);
  console.log('  Chunks:', chunks.length);

  // Insert chunks
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const { data: chunkData, error: chunkError } = await supabase
      .from('document_chunks')
      .insert({
        document_id: docData.id,
        content: chunk.content,
        chunk_index: chunk.metadata.chunkIndex,
        token_count: chunk.metadata.tokenCount,
        metadata: { section_headers: chunk.metadata.sectionHeaders },
      })
      .select('id')
      .single();

    if (chunkError) throw new Error('Chunk insert failed: ' + chunkError.message);

    // Generate embedding
    const result = await generateBatchEmbeddings([chunk.content]);
    const embeddingStr = formatEmbeddingForPgVector(result.embeddings[0]!.embedding);

    const { error: embError } = await supabase.from('embeddings').insert({
      chunk_id: chunkData.id,
      embedding: embeddingStr,
      model_version: 'text-embedding-3-small',
    });

    if (embError) throw new Error('Embedding insert failed: ' + embError.message);

    process.stdout.write('.');
  }

  console.log('\n  Done!');
}

const files = process.argv.slice(2);
if (files.length === 0) {
  // Default to the 3 failed files
  files.push(
    'knowledge-base/01-fundamentals/motivation-scoring-fundamentals.md',
    'knowledge-base/02-filters/filter-failed-listing.md',
    'knowledge-base/09-legal-compliance/disclosure-requirements.md'
  );
}

(async () => {
  for (const file of files) {
    try {
      await ingestFile(file);
    } catch (e) {
      console.error('Error:', file, e);
    }
  }
  console.log('All done!');
})();
