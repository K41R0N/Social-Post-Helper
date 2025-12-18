import { useState, useMemo } from 'react';
import type { SlideData, LayoutType } from '@/types/carousel';
import LayoutRenderer from './LayoutRenderer';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { getAllCustomLayouts } from '@/lib/customLayoutStorage';

interface LayoutExplorerProps {
  open: boolean;
  onClose: () => void;
  slide: SlideData;
  onApplyLayout: (layoutType: LayoutType | string) => void;
  onApplyToAll?: (layoutType: LayoutType | string) => void;
}

// Built-in layout definitions with metadata
const BUILT_IN_LAYOUTS = [
  { id: 'dictionary_entry', name: 'Dictionary Entry', category: 'Text', description: 'Title, pronunciation, etymology, definition' },
  { id: 'minimalist_focus', name: 'Minimalist Focus', category: 'Text', description: 'Large title and body on solid background' },
  { id: 'bold_callout', name: 'Bold Callout', category: 'Impact', description: 'Centered large text for impact' },
  { id: 'header_body', name: 'Header & Body', category: 'Text', description: 'Simple title + body layout' },
  { id: 'quote_highlight', name: 'Quote Highlight', category: 'Quote', description: 'Large quote with attribution' },
  { id: 'list_layout', name: 'List Layout', category: 'Text', description: 'Title with bulleted/numbered list' },
  { id: 'stat_showcase', name: 'Stat Showcase', category: 'Impact', description: 'Large number with context' },
  { id: 'split_content', name: 'Split Content', category: 'Text', description: 'Two-column layout' },
  { id: 'image_overlay', name: 'Image Overlay', category: 'Media', description: 'Text over background image' },
  { id: 'two_part_vertical', name: 'Two-Part Vertical', category: 'Text', description: 'Top/bottom sections' },
  { id: 'anti_marketing_hook', name: 'Hook (Anti-Marketing)', category: 'Marketing', description: 'Brutalist hook with strapline' },
  { id: 'anti_marketing_content', name: 'Content (Anti-Marketing)', category: 'Marketing', description: 'Editorial block with accent' },
  { id: 'anti_marketing_cta', name: 'CTA (Anti-Marketing)', category: 'Marketing', description: 'CTA card with arrow' },
] as const;

const LAYOUT_CATEGORIES = ['All', 'Text', 'Impact', 'Quote', 'Media', 'Marketing', 'Custom'] as const;

export default function LayoutExplorer({
  open,
  onClose,
  slide,
  onApplyLayout,
  onApplyToAll
}: LayoutExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewLayout, setPreviewLayout] = useState<string>(slide.layout_type);
  const [compareMode, setCompareMode] = useState(false);
  const [compareLayout, setCompareLayout] = useState<string | null>(null);

  // Get custom layouts
  const customLayouts = getAllCustomLayouts();

  // All available layouts
  const allLayouts = useMemo(() => {
    const builtIn = BUILT_IN_LAYOUTS.map(l => ({
      ...l,
      isCustom: false
    }));
    const custom = customLayouts.map(l => ({
      id: `custom-${l.id}`,
      name: l.name,
      category: 'Custom',
      description: l.description || 'Custom layout',
      isCustom: true
    }));
    return [...builtIn, ...custom];
  }, [customLayouts]);

  // Filter layouts by category
  const filteredLayouts = useMemo(() => {
    if (selectedCategory === 'All') return allLayouts;
    return allLayouts.filter(l => l.category === selectedCategory);
  }, [allLayouts, selectedCategory]);

  // Create preview slide with selected layout
  const getPreviewSlide = (layoutType: string): SlideData => ({
    ...slide,
    layout_type: layoutType as LayoutType
  });

  const handleApply = () => {
    onApplyLayout(previewLayout as LayoutType);
    onClose();
  };

  const handleApplyToAll = () => {
    if (onApplyToAll) {
      onApplyToAll(previewLayout as LayoutType);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Layout Explorer</DialogTitle>
          <DialogDescription>
            Test different layouts with your content. Current: <Badge variant="outline">{slide.layout_type}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full overflow-hidden">
          {/* Sidebar - Layout List */}
          <div className="w-80 border-r flex flex-col">
            {/* Category Filter */}
            <div className="p-4 border-b">
              <div className="flex flex-wrap gap-2">
                {LAYOUT_CATEGORIES.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Layout List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {filteredLayouts.map(layout => (
                  <Card
                    key={layout.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      previewLayout === layout.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setPreviewLayout(layout.id)}
                  >
                    <CardHeader className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {layout.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {layout.description}
                          </p>
                        </div>
                        {layout.isCustom && (
                          <Badge variant="secondary" className="text-xs">Custom</Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="p-4 border-t space-y-2">
              <Button
                className="w-full"
                size="sm"
                variant={compareMode ? 'outline' : 'default'}
                onClick={() => {
                  setCompareMode(!compareMode);
                  if (!compareMode) setCompareLayout(slide.layout_type);
                }}
              >
                {compareMode ? 'Exit Compare Mode' : 'Compare Layouts'}
              </Button>
            </div>
          </div>

          {/* Main Preview Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto bg-muted/20">
              {compareMode ? (
                // Split view for comparison
                <div className="h-full grid grid-cols-2 gap-4 p-6">
                  {/* Current/Original Layout */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Current Layout</h3>
                      <Badge variant="outline">{slide.layout_type}</Badge>
                    </div>
                    <div
                      className="bg-white rounded-lg shadow-lg overflow-hidden"
                      style={{
                        width: '540px',
                        height: '540px',
                        transform: 'scale(0.9)',
                        transformOrigin: 'top left'
                      }}
                    >
                      <LayoutRenderer slide={getPreviewSlide(compareLayout || slide.layout_type)} />
                    </div>
                  </div>

                  {/* Preview Layout */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Preview Layout</h3>
                      <Badge>{allLayouts.find(l => l.id === previewLayout)?.name}</Badge>
                    </div>
                    <div
                      className="bg-white rounded-lg shadow-lg overflow-hidden"
                      style={{
                        width: '540px',
                        height: '540px',
                        transform: 'scale(0.9)',
                        transformOrigin: 'top left'
                      }}
                    >
                      <LayoutRenderer slide={getPreviewSlide(previewLayout)} />
                    </div>
                  </div>
                </div>
              ) : (
                // Full preview
                <div className="flex items-center justify-center h-full p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="text-lg px-4 py-2">
                        {allLayouts.find(l => l.id === previewLayout)?.name}
                      </Badge>
                    </div>
                    <div
                      className="bg-white rounded-lg shadow-2xl overflow-hidden"
                      style={{ width: '1080px', height: '1080px' }}
                    >
                      <LayoutRenderer slide={getPreviewSlide(previewLayout)} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="border-t p-4 bg-background">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {previewLayout === slide.layout_type ? (
                    <span>Showing current layout</span>
                  ) : (
                    <span className="text-primary font-medium">
                      Layout changed: {slide.layout_type} → {allLayouts.find(l => l.id === previewLayout)?.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  {onApplyToAll && previewLayout !== slide.layout_type && (
                    <Button variant="secondary" onClick={handleApplyToAll}>
                      Apply to All Slides
                    </Button>
                  )}
                  <Button
                    onClick={handleApply}
                    disabled={previewLayout === slide.layout_type}
                  >
                    Apply Layout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
