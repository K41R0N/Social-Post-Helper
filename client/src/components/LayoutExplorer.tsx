import { useState, useMemo } from 'react';
import type { SlideData, LayoutType } from '@/types/carousel';
import LayoutRenderer from './LayoutRenderer';
import ComponentRenderer from './ComponentRenderer';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Badge } from './ui/badge';
import { getAllCustomLayouts } from '@/lib/customLayoutStorage';
import { getAllComponentLayouts } from '@/lib/componentLayoutStorage';
import { getFontSettings } from '@/lib/fontStorage';
import type { ComponentContext } from '@/types/componentLayout';

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

const LAYOUT_CATEGORIES = ['All', 'Text', 'Impact', 'Quote', 'Media', 'Marketing', 'Custom', 'Component'] as const;

export default function LayoutExplorer({
  open,
  onClose,
  slide,
  onApplyLayout,
  onApplyToAll
}: LayoutExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewLayout, setPreviewLayout] = useState<string>(slide.layout_type);

  // Get custom and component layouts
  const customLayouts = getAllCustomLayouts();
  const componentLayouts = getAllComponentLayouts();

  // All available layouts
  const allLayouts = useMemo(() => {
    const builtIn = BUILT_IN_LAYOUTS.map(l => ({
      ...l,
      isCustom: false,
      isComponent: false
    }));
    const custom = customLayouts.map(l => ({
      id: `custom-${l.id}`,
      name: l.name,
      category: 'Custom',
      description: l.description || 'Custom layout',
      isCustom: true,
      isComponent: false
    }));
    const component = componentLayouts.map(l => ({
      id: `component-${l.id}`,
      name: l.name,
      category: 'Component',
      description: l.description || 'Component-based layout',
      isCustom: false,
      isComponent: true
    }));
    return [...builtIn, ...custom, ...component];
  }, [customLayouts, componentLayouts]);

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

  // Render the appropriate component based on layout type
  const renderLayout = (layoutType: string) => {
    // Check if it's a component-based layout
    if (layoutType.startsWith('component-')) {
      const layoutId = layoutType.replace('component-', '');
      const componentLayout = componentLayouts.find(l => l.id === layoutId);

      if (!componentLayout) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Layout not found</div>;
      }

      // Create context for ComponentRenderer
      const context: ComponentContext = {
        slideData: {
          title: slide.title,
          body_text: slide.body_text,
          subtitle: slide.subtitle,
          quote: slide.quote,
          image_url: slide.image_url,
          background_color: slide.background_color,
          font_color: slide.font_color,
          accent_color: slide.accent_color,
        },
        fonts: getFontSettings(),
      };

      return <ComponentRenderer schema={componentLayout} context={context} />;
    }

    // Use LayoutRenderer for built-in and custom layouts
    return <LayoutRenderer slide={getPreviewSlide(layoutType)} />;
  };

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
      <DialogContent className="!w-[95vw] !max-w-[2000px] h-[92vh] p-0 flex flex-col border-4 border-black rounded-3xl">
        <DialogHeader className="px-10 pt-10 pb-8 border-b-3 border-black flex-shrink-0">
          <DialogTitle className="text-3xl font-bold mb-3">LAYOUT EXPLORER</DialogTitle>
          <DialogDescription className="text-base">
            Test different layouts with your content. Current: <Badge variant="outline" className="ml-2 text-sm">{slide.layout_type}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Sidebar - Layout List (Narrower) */}
          <div className="w-[280px] border-r-3 border-black flex flex-col">
            {/* Category Filter */}
            <div className="p-6 border-b-3 border-black">
              <h3 className="text-xs font-bold uppercase mb-3 text-gray-600">Category</h3>
              <div className="flex flex-wrap gap-1.5">
                {LAYOUT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`px-3 py-1.5 rounded-full font-bold uppercase text-[10px] transition-all border-2 border-black ${
                      selectedCategory === cat
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {filteredLayouts.map(layout => (
                  <div
                    key={layout.id}
                    className={`cursor-pointer transition-all p-3 rounded-xl border-[3px] ${
                      previewLayout === layout.id
                        ? 'border-coral bg-coral bg-opacity-5 shadow-md'
                        : 'border-black hover:bg-gray-50'
                    }`}
                    onClick={() => setPreviewLayout(layout.id)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold mb-1 leading-tight">
                          {layout.name}
                        </h4>
                        <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                          {layout.description}
                        </p>
                      </div>
                      {(layout.isCustom || layout.isComponent) && (
                        <div className="flex-shrink-0">
                          {layout.isCustom && (
                            <span className="inline-block w-2 h-2 bg-purple-600 rounded-full" title="Custom"></span>
                          )}
                          {layout.isComponent && (
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full" title="Component"></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Action Buttons - Moved to Sidebar Bottom */}
            <div className="p-4 border-t-3 border-black bg-white space-y-2">
              <button
                className={`w-full dof-btn dof-btn-sm ${
                  previewLayout === slide.layout_type
                    ? 'dof-btn-outline opacity-50 cursor-not-allowed'
                    : 'dof-btn-coral'
                }`}
                onClick={handleApply}
                disabled={previewLayout === slide.layout_type}
              >
                Apply Layout
              </button>
              {onApplyToAll && previewLayout !== slide.layout_type && (
                <button
                  className="w-full dof-btn dof-btn-black dof-btn-sm"
                  onClick={handleApplyToAll}
                >
                  Apply to All Slides
                </button>
              )}
              <button
                className="w-full dof-btn dof-btn-outline dof-btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Main Preview Area - TRUE 1:1 PREVIEW */}
          <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              {/* Layout Name Badge */}
              <div className="mb-6">
                <span className="px-6 py-3 bg-black text-white border-[3px] border-black rounded-full text-lg font-bold shadow-lg">
                  {allLayouts.find(l => l.id === previewLayout)?.name}
                </span>
              </div>

              {/* TRUE 1:1 Preview - Actual Export Size! */}
              <div
                className="bg-white rounded-2xl border-[3px] border-black shadow-2xl overflow-hidden"
                style={{ width: '1080px', height: '1080px' }}
              >
                {renderLayout(previewLayout)}
              </div>

              {/* True Size Badge */}
              <div className="mt-4 px-4 py-2 bg-green-100 border-2 border-green-600 rounded-full">
                <span className="text-sm text-green-800 font-bold">
                  ✓ 1:1 Preview (1080×1080px - Actual Size)
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
