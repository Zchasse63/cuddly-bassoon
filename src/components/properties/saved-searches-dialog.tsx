'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SavedSearch } from '@/lib/filters/saved-searches';
import type { ActiveFilter, FilterCombinationMode } from '@/lib/filters/types';
import { getFilterById } from '@/lib/filters/registry';

interface SavedSearchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedSearches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
  onSave: (name: string, description?: string) => void;
  currentFilters: ActiveFilter[];
  currentMode: FilterCombinationMode;
  isLoading?: boolean;
}

function SavedSearchItem({
  search,
  onLoad,
  onDelete,
}: {
  search: SavedSearch;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const filterCount = search.filters.activeFilters.length;
  const filterNames = search.filters.activeFilters
    .slice(0, 3)
    .map((f) => getFilterById(f.filterId)?.name || f.filterId)
    .join(', ');

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{search.name}</h4>
        {search.description && (
          <p className="text-sm text-muted-foreground truncate">{search.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {filterCount} filter{filterCount !== 1 ? 's' : ''}: {filterNames}
          {filterCount > 3 && ` +${filterCount - 3} more`}
        </p>
        <p className="text-xs text-muted-foreground">
          Mode: {search.filters.filterMode}
          {search.resultsCount !== null && ` • ${search.resultsCount} results`}
        </p>
      </div>
      <div className="flex gap-2 ml-4">
        <Button variant="outline" size="sm" onClick={onLoad}>
          Load
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export function SavedSearchesDialog({
  open,
  onOpenChange,
  savedSearches,
  onLoad,
  onDelete,
  onSave,
  currentFilters,
  currentMode: _currentMode,
  isLoading,
}: SavedSearchesDialogProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName.trim(), saveDescription.trim() || undefined);
    setSaveName('');
    setSaveDescription('');
    setShowSaveForm(false);
  };

  const canSave = currentFilters.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Saved Searches</DialogTitle>
          <DialogDescription>
            Save your current filter configuration or load a previous search
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save Current Search */}
          {canSave && (
            <div className="border rounded-lg p-3">
              {!showSaveForm ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSaveForm(true)}
                >
                  Save Current Search ({currentFilters.length} filters)
                </Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="save-name">Name</Label>
                    <Input
                      id="save-name"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="My Search"
                    />
                  </div>
                  <div>
                    <Label htmlFor="save-desc">Description (optional)</Label>
                    <Input
                      id="save-desc"
                      value={saveDescription}
                      onChange={(e) => setSaveDescription(e.target.value)}
                      placeholder="Description..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!saveName.trim() || isLoading}>
                      Save
                    </Button>
                    <Button variant="ghost" onClick={() => setShowSaveForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Saved Searches List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {savedSearches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved searches yet
                </p>
              ) : (
                savedSearches.map((search) => (
                  <SavedSearchItem
                    key={search.id}
                    search={search}
                    onLoad={() => onLoad(search)}
                    onDelete={() => onDelete(search.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

