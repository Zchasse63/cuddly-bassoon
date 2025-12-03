/**
 * Document Processor for Knowledge Base
 * Parses markdown files with YAML frontmatter and extracts metadata
 */

import matter from 'gray-matter';

export interface DocumentMetadata {
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  tags: string[];
  related_docs: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_reading_time?: string;
  last_updated?: string;
  version?: string;
}

export interface ProcessedDocument {
  metadata: DocumentMetadata;
  content: string;
  rawContent: string;
}

export interface ProcessingError {
  file: string;
  error: string;
}

export interface ProcessingResult {
  success: boolean;
  document?: ProcessedDocument;
  error?: string;
}

/**
 * Parse a markdown file with YAML frontmatter
 */
export function parseDocument(fileContent: string, _filePath: string): ProcessingResult {
  try {
    const { data, content } = matter(fileContent);
    
    // Validate required fields
    const requiredFields = ['slug', 'title', 'category'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Normalize and validate metadata
    const metadata: DocumentMetadata = {
      slug: String(data.slug).trim(),
      title: String(data.title).trim(),
      category: String(data.category).trim(),
      subcategory: data.subcategory ? String(data.subcategory).trim() : undefined,
      tags: normalizeArray(data.tags),
      related_docs: normalizeArray(data.related_docs),
      difficulty_level: normalizeDifficulty(data.difficulty_level),
      estimated_reading_time: data.estimated_reading_time ? String(data.estimated_reading_time) : undefined,
      last_updated: data.last_updated ? String(data.last_updated) : undefined,
      version: data.version ? String(data.version) : undefined,
    };

    // Clean and normalize content
    const cleanedContent = cleanMarkdownContent(content);

    return {
      success: true,
      document: {
        metadata,
        content: cleanedContent,
        rawContent: content
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

/**
 * Normalize array fields (tags, related_docs)
 */
function normalizeArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Normalize difficulty level to valid enum value
 */
function normalizeDifficulty(value: unknown): 'beginner' | 'intermediate' | 'advanced' {
  const normalized = String(value || 'intermediate').toLowerCase().trim();
  if (['beginner', 'intermediate', 'advanced'].includes(normalized)) {
    return normalized as 'beginner' | 'intermediate' | 'advanced';
  }
  return 'intermediate';
}

/**
 * Clean markdown content for processing
 * - Remove excessive whitespace
 * - Normalize line endings
 * - Trim leading/trailing whitespace
 */
function cleanMarkdownContent(content: string): string {
  return content
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive blank lines (more than 2 consecutive)
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
}

/**
 * Extract the first heading from markdown content
 */
export function extractFirstHeading(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match && match[1] ? match[1].trim() : null;
}

/**
 * Get document category from file path
 * e.g., "knowledge-base/01-fundamentals/file.md" -> "Fundamentals"
 */
export function getCategoryFromPath(filePath: string): string {
  const parts = filePath.split('/');
  const categoryFolder = parts.find(part => /^\d{2}-/.test(part));
  if (categoryFolder) {
    // Remove leading number and dashes, capitalize
    return categoryFolder
      .replace(/^\d{2}-/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return 'General';
}

/**
 * Validate document metadata for completeness
 */
export function validateMetadata(metadata: DocumentMetadata): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!metadata.slug || metadata.slug.length < 3) {
    issues.push('Slug must be at least 3 characters');
  }

  if (!metadata.title || metadata.title.length < 5) {
    issues.push('Title must be at least 5 characters');
  }

  if (!metadata.category) {
    issues.push('Category is required');
  }

  if (metadata.tags.length === 0) {
    issues.push('At least one tag is recommended');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

