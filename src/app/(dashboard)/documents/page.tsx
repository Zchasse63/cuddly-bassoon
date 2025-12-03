'use client';

import { FileText, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageContext } from '@/hooks/usePageContext';

/**
 * Documents Page - Document management
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 5
 */
export default function DocumentsPage() {
  usePageContext('documents');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-description">Manage contracts, agreements, and other documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-state__icon">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="empty-state__title">No documents yet</h3>
        <p className="empty-state__description">
          Upload documents or use AI to generate contracts and agreements.
        </p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
        </div>
      </div>
    </div>
  );
}
