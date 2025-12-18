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
  DialogTitle,
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
  const [compareMode, setCompareMode] = useState(false);
  const [compareLayout, setCompareLayout] = useState<string | null>(null);

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
          {/* Sidebar - Layout List */}
          <div className="w-[400px] border-r-3 border-black flex flex-col">
            {/* Category Filter */}
            <div className="p-8 border-b-3 border-black">
              <h3 className="text-sm font-bold uppercase mb-4">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                {LAYOUT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`px-6 py-2.5 rounded-full font-bold uppercase text-xs transition-all border-2 border-black ${
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
              <div className="p-6 space-y-3">
                {filteredLayouts.map(layout => (
                  <div
                    key={layout.id}
                    className={`cursor-pointer transition-all p-5 rounded-2xl border-3 ${
                      previewLayout === layout.id
                        ? 'border-black bg-gray-50 shadow-lg'
                        : 'border-gray-300 hover:border-black hover:shadow-md'
                    }`}
                    onClick={() => setPreviewLayout(layout.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold mb-2 leading-tight">
                          {layout.name}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {layout.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {layout.isCustom && (
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border-2 border-purple-800 rounded-full text-xs font-bold">
                            CUSTOM
                          </span>
                        )}
                        {layout.isComponent && (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border-2 border-blue-800 rounded-full text-xs font-bold">
                            COMPONENT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="p-8 border-t-3 border-black space-y-3">
              <button
                className={`w-full px-6 py-4 rounded-2xl font-bold uppercase text-sm transition-all border-3 ${
                  compareMode
                    ? 'border-black bg-white text-black hover:bg-gray-100'
                    : 'border-black bg-black text-white hover:bg-gray-800'
                }`}
                onClick={() => {
                  setCompareMode(!compareMode);
                  if (!compareMode) setCompareLayout(slide.layout_type);
                }}
              >
                {compareMode ? 'Exit Compare Mode' : 'Compare Layouts'}
              </button>
            </div>
          </div>

          {/* Main Preview Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto bg-gray-50 p-10">
              {compareMode ? (
                // Split view for comparison
                <div className="h-full grid grid-cols-2 gap-8">
                  {/* Current/Original Layout */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h3 className="text-lg font-bold uppercase">Current Layout</h3>
                      <span className="px-4 py-2 bg-gray-200 border-2 border-black rounded-full text-sm font-bold">
                        {slide.layout_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-center flex-1">
                      <div
                        className="bg-white rounded-2xl border-3 border-black shadow-xl overflow-hidden"
                        style={{
                          width: '540px',
                          height: '540px'
                        }}
                      >
                        {renderLayout(compareLayout || slide.layout_type)}
                      </div>
                    </div>
                  </div>

                  {/* Preview Layout */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h3 className="text-lg font-bold uppercase">Preview Layout</h3>
                      <span className="px-4 py-2 bg-black text-white border-2 border-black rounded-full text-sm font-bold">
                        {allLayouts.find(l => l.id === previewLayout)?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-center flex-1">
                      <div
                        className="bg-white rounded-2xl border-3 border-black shadow-xl overflow-hidden"
                        style={{
                          width: '540px',
                          height: '540px'
                        }}
                      >
                        {renderLayout(previewLayout)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Full preview
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="mb-6">
                    <span className="px-6 py-3 bg-black text-white border-2 border-black rounded-full text-base font-bold">
                      {allLayouts.find(l => l.id === previewLayout)?.name}
                    </span>
                  </div>
                  <div
                    className="bg-white rounded-2xl border-4 border-black shadow-2xl overflow-hidden"
                    style={{ width: '600px', height: '600px' }}
                  >
                    {renderLayout(previewLayout)}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="border-t-3 border-black p-8 bg-white flex-shrink-0">
              <div className="flex items-center justify-between gap-6">
                <div className="text-base">
                  {previewLayout === slide.layout_type ? (
                    <span className="text-gray-600 font-medium">Showing current layout</span>
                  ) : (
                    <span className="text-black font-bold">
                      Layout changed: <span className="text-gray-600">{slide.layout_type}</span> → <span className="text-coral">{allLayouts.find(l => l.id === previewLayout)?.name}</span>
                    </span>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    className="px-8 py-4 border-3 border-black rounded-2xl font-bold uppercase text-sm bg-white hover:bg-gray-100 transition-colors"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  {onApplyToAll && previewLayout !== slide.layout_type && (
                    <button
                      className="px-8 py-4 border-3 border-black bg-blue-500 text-white rounded-2xl font-bold uppercase text-sm hover:bg-blue-600 transition-colors"
                      onClick={handleApplyToAll}
                    >
                      Apply to All Slides
                    </button>
                  )}
                  <button
                    className={`px-8 py-4 border-3 border-black rounded-2xl font-bold uppercase text-sm transition-colors ${
                      previewLayout === slide.layout_type
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-coral text-white hover:bg-coral-dark'
                    }`}
                    onClick={handleApply}
                    disabled={previewLayout === slide.layout_type}
                  >
                    Apply Layout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
