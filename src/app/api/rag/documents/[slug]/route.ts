/**
 * RAG Document Detail API Endpoint
 * Get full document content by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDocumentBySlug, getRelatedDocuments } from '@/lib/rag/search';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const document = await getDocumentBySlug(slug);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get related documents
    let related: Awaited<ReturnType<typeof getRelatedDocuments>> = [];
    try {
      related = await getRelatedDocuments(document.id, 3);
    } catch {
      // Ignore errors fetching related docs
    }

    return NextResponse.json({
      document: {
        ...document,
        related: related.map(r => ({
          title: r.metadata.title,
          slug: r.metadata.slug,
          category: r.metadata.category,
          relevance: r.similarity,
        })),
      },
    });
  } catch (error) {
    console.error('Document detail API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

