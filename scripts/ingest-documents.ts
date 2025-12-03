#!/usr/bin/env npx tsx
/**
 * CLI Script for Document Ingestion
 * Usage: npx tsx scripts/ingest-documents.ts [path-to-knowledge-base]
 */

import path from 'path';
import { ingestAllDocuments, type IngestionProgress } from '../src/lib/rag/ingestion';

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

const KNOWLEDGE_BASE_PATH = process.argv[2] || path.join(process.cwd(), 'knowledge-base');

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function progressBar(current: number, total: number, width = 30): string {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${current}/${total}`;
}

function handleProgress(progress: IngestionProgress): void {
  const bar = progressBar(progress.current, progress.total);
  const phase = progress.phase.toUpperCase().padEnd(10);
  const file = progress.currentFile ? ` - ${progress.currentFile}` : '';
  const msg = progress.message ? ` (${progress.message})` : '';
  
  process.stdout.write(`\r${phase} ${bar}${file}${msg}`.padEnd(100));
  
  if (progress.phase === 'complete') {
    console.log('\n');
  }
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       Knowledge Base Document Ingestion                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`📁 Knowledge Base Path: ${KNOWLEDGE_BASE_PATH}\n`);

  // Verify environment variables
  const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }

  console.log('✅ Environment variables verified\n');
  console.log('Starting ingestion...\n');

  try {
    const result = await ingestAllDocuments(KNOWLEDGE_BASE_PATH, handleProgress);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                     INGESTION COMPLETE                        ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`📄 Documents Processed: ${result.documentsProcessed}`);
    console.log(`📦 Chunks Created:      ${result.chunksCreated}`);
    console.log(`🧠 Embeddings Generated: ${result.embeddingsGenerated}`);
    console.log(`⏱️  Duration:            ${formatDuration(result.duration)}`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors (${result.errors.length}):`);
      result.errors.forEach(({ file, error }) => {
        console.log(`   - ${file}: ${error}`);
      });
    }

    console.log(`\n${result.success ? '✅ Success!' : '⚠️  Completed with errors'}`);
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal error during ingestion:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

