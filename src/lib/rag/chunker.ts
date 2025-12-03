/**
 * Text Chunker for RAG System
 * Splits markdown documents into chunks while respecting structure
 */

import { encode } from 'gpt-tokenizer';

export interface ChunkMetadata {
  chunkIndex: number;
  tokenCount: number;
  sectionHeaders: string[];
}

export interface DocumentChunk {
  content: string;
  metadata: ChunkMetadata;
}

export interface ChunkerOptions {
  maxTokens: number;
  minTokens: number;
  overlapTokens: number;
}

const DEFAULT_OPTIONS: ChunkerOptions = {
  maxTokens: 800,
  minTokens: 100,
  overlapTokens: 150,
};

interface Section {
  header: string | null;
  level: number;
  content: string;
}

export function countTokens(text: string): number {
  try {
    return encode(text).length;
  } catch {
    return Math.ceil(text.length / 4);
  }
}

function createChunk(content: string, index: number, headers: string[]): DocumentChunk {
  return {
    content: content.trim(),
    metadata: {
      chunkIndex: index,
      tokenCount: countTokens(content),
      sectionHeaders: [...headers],
    }
  };
}

function isCodeBlock(text: string): boolean {
  return text.startsWith('```') || text.startsWith('    ');
}

function isList(text: string): boolean {
  const lines = text.split('\n');
  const listPattern = /^(\s*[-*+]|\s*\d+\.)\s/;
  const listLines = lines.filter(line => listPattern.test(line));
  return listLines.length > lines.length * 0.5;
}

function splitByHeaders(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: Section = { header: null, level: 0, content: '' };

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch && headerMatch[1]) {
      if (currentSection.content.trim() || currentSection.header) {
        sections.push(currentSection);
      }
      currentSection = { header: line, level: headerMatch[1].length, content: '' };
    } else {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection.content.trim() || currentSection.header) {
    sections.push(currentSection);
  }
  return sections;
}

function updateHeaderStack(stack: string[], header: string, level: number): void {
  while (stack.length >= level) {
    stack.pop();
  }
  stack.push(header.replace(/^#+\s+/, ''));
}

function splitLargeSection(
  content: string,
  opts: ChunkerOptions,
  headers: string[],
  startIndex: number
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const paragraphs = content.split(/\n\n+/);
  let currentChunk = '';
  let chunkIndex = startIndex;

  for (const para of paragraphs) {
    const paraTokens = countTokens(para);
    const currentTokens = countTokens(currentChunk);

    if ((isCodeBlock(para) || isList(para)) && paraTokens > opts.maxTokens) {
      if (currentChunk) {
        chunks.push(createChunk(currentChunk, chunkIndex++, headers));
        currentChunk = '';
      }
      chunks.push(createChunk(para, chunkIndex++, headers));
    } else if (currentTokens + paraTokens > opts.maxTokens) {
      if (currentChunk) {
        chunks.push(createChunk(currentChunk, chunkIndex++, headers));
      }
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(createChunk(currentChunk, chunkIndex++, headers));
  }
  return chunks;
}

function addOverlap(chunks: DocumentChunk[], overlapTokens: number): DocumentChunk[] {
  if (chunks.length <= 1) return chunks;

  return chunks.map((chunk, index) => {
    if (index === 0) return chunk;
    const prevChunk = chunks[index - 1];
    if (!prevChunk) return chunk;
    const prevLines = prevChunk.content.split('\n');
    let overlapContent = '';
    let overlapTokenCount = 0;

    for (let i = prevLines.length - 1; i >= 0 && overlapTokenCount < overlapTokens; i--) {
      const line = prevLines[i];
      if (line === undefined) continue;
      overlapContent = line + (overlapContent ? '\n' + overlapContent : '');
      overlapTokenCount += countTokens(line);
    }

    if (overlapContent) {
      const newContent = `[...continued]\n${overlapContent}\n\n${chunk.content}`;
      return {
        content: newContent,
        metadata: { ...chunk.metadata, tokenCount: countTokens(newContent) }
      };
    }
    return chunk;
  });
}

export function chunkDocument(content: string, options: Partial<ChunkerOptions> = {}): DocumentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: DocumentChunk[] = [];
  const sections = splitByHeaders(content);
  let chunkIndex = 0;
  const currentHeaders: string[] = [];

  for (const section of sections) {
    if (section.header) {
      updateHeaderStack(currentHeaders, section.header, section.level);
    }
    const sectionContent = section.header
      ? `${section.header}\n\n${section.content}`.trim()
      : section.content.trim();

    if (!sectionContent) continue;
    const sectionTokens = countTokens(sectionContent);

    if (sectionTokens <= opts.maxTokens) {
      chunks.push(createChunk(sectionContent, chunkIndex++, currentHeaders));
    } else {
      const subChunks = splitLargeSection(sectionContent, opts, currentHeaders, chunkIndex);
      chunks.push(...subChunks);
      chunkIndex += subChunks.length;
    }
  }
  return addOverlap(chunks, opts.overlapTokens);
}
