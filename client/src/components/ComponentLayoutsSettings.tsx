import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CodeEditorPanel from './CodeEditorPanel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Code,
  Sparkles,
  Copy,
  Info,
  Zap,
} from 'lucide-react';
import ComponentRenderer from './ComponentRenderer';
import { getFontSettings } from '@/lib/fontStorage';
import {
  getAllComponentLayouts,
  saveComponentLayout,
  deleteComponentLayout,
  exportLayoutToJSON,
  importLayoutFromJSON,
  duplicateComponentLayout,
  getLayoutStats,
} from '@/lib/componentLayoutStorage';
import { QUICK_START_TEMPLATES } from '@/lib/componentLibrary';
import type { LayoutSchema, ComponentContext } from '@/types/componentLayout';

export default function ComponentLayoutsSettings() {
  const [componentLayouts, setComponentLayouts] = useState<LayoutSchema[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<LayoutSchema | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<LayoutSchema | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState<string | null>(null);

  // Form state
  const [layoutName, setLayoutName] = useState('');
  const [layoutDescription, setLayoutDescription] = useState('');
  const [schemaCode, setSchemaCode] = useState('');

  useEffect(() => {
    loadComponentLayouts();
  }, []);

  const loadComponentLayouts = () => {
    const layouts = getAllComponentLayouts();
    setComponentLayouts(layouts);
  };

  const handleNewLayout = () => {
    setEditingLayout(null);
    setLayoutName('');
    setLayoutDescription('');
    setSchemaCode(JSON.stringify(getDefaultSchema(), null, 2));
    setEditorOpen(true);
  };

  const handleEditLayout = (layout: LayoutSchema) => {
    setEditingLayout(layout);
    setLayoutName(layout.name);
    setLayoutDescription(layout.description || '');
    setSchemaCode(JSON.stringify(layout, null, 2));
    setEditorOpen(true);
  };

  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    try {
      // Parse schema from code editor
      const parsedSchema = JSON.parse(schemaCode);

      const layout: LayoutSchema = {
        ...parsedSchema,
        id: editingLayout?.id || `layout-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        name: layoutName,
        description: layoutDescription,
        updatedAt: Date.now(),
        createdAt: editingLayout?.createdAt || Date.now(),
      };

      // Validate schema has required fields (allow 0 as valid value)
      if (layout.root == null || layout.width === undefined || layout.height === undefined) {
        toast.error('Invalid schema: missing root, width, or height');
        return;
      }

      try {
        saveComponentLayout(layout);
        loadComponentLayouts();
        setEditorOpen(false);
        toast.success(editingLayout ? 'Layout updated' : 'Layout created');
      } catch (saveError: any) {
        console.error('Error saving layout:', saveError);

        // Check for quota exceeded error
        if (saveError?.message?.includes('quota') || saveError?.message?.includes('QuotaExceeded') || saveError?.name === 'QuotaExceededError') {
          toast.error('Storage quota exceeded. Please delete some layouts or export them first.', { duration: 5000 });
        } else {
          toast.error(`Failed to save layout: ${saveError?.message || 'Unknown error'}`, { duration: 5000 });
        }
      }
    } catch (error: any) {
      console.error('Error parsing schema:', error);
      toast.error(`Invalid JSON schema: ${error?.message || 'Syntax error'}`, { duration: 5000 });
    }
  };

  const handleDeleteLayout = (id: string) => {
    setLayoutToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteLayout = () => {
    if (!layoutToDelete) return;

    try {
      deleteComponentLayout(layoutToDelete);
      loadComponentLayouts();
      toast.success('Layout deleted');
      setDeleteConfirmOpen(false);
      setLayoutToDelete(null);
    } catch (error) {
      toast.error('Failed to delete layout');
    }
  };

  const handleDuplicateLayout = (id: string) => {
    const name = prompt('Enter a name for the duplicated layout:');
    if (name) {
      try {
        duplicateComponentLayout(id, name);
        loadComponentLayouts();
        toast.success('Layout duplicated');
      } catch (error) {
        console.error('Error duplicating layout:', error);
        toast.error('Failed to duplicate layout');
      }
    }
  };

  const handlePreview = (layout: LayoutSchema) => {
    setPreviewLayout(layout);
    setPreviewOpen(true);
  };

  const handleExport = () => {
    if (componentLayouts.length === 0) {
      toast.error('No layouts to export');
      return;
    }

    const dataStr = JSON.stringify(componentLayouts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `component-layouts-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Layouts exported');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Support both single layout and array of layouts
        const layouts = Array.isArray(parsed) ? parsed : [parsed];

        // Save each layout
        layouts.forEach(layout => {
          saveComponentLayout(layout);
        });

        loadComponentLayouts();
        toast.success(`${layouts.length} layout${layouts.length > 1 ? 's' : ''} imported successfully`);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import layout');
      } finally {
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      console.error('FileReader error:', reader.error?.message || 'Unknown file read error');
      toast.error('Failed to read file. Please try again.');
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = QUICK_START_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setLayoutName(template.name);
    setLayoutDescription(template.description);
    setSchemaCode(JSON.stringify(template.schema, null, 2));
    setEditingLayout(null);
    setEditorOpen(true);
    toast.success('Template loaded');
  };

  const getDefaultSchema = (): Partial<LayoutSchema> => ({
    width: 1080,
    height: 1080,
    root: {
      id: 'root',
      type: 'container',
      children: [],
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: { top: 80, right: 80, bottom: 80, left: 80 },
        backgroundColor: '{{background_color}}',
      },
    },
  });

  const renderPreview = () => {
    if (!previewLayout) return null;

    const context: ComponentContext = {
      slideData: {
        title: 'Preview Title',
        body_text: 'This is sample body text to demonstrate the layout.',
        subtitle: 'Subtitle text',
        quote: '"Sample quote text for preview"',
        image_url: '',
        background_color: '#f4f1ee',
        font_color: '#1a1a1a',
        accent_color: '#B8312F',
      },
      fonts: getFontSettings(),
    };

    // Calculate scale to fit preview container
    const containerSize = 540;
    const scale = Math.min(
      containerSize / previewLayout.width,
      containerSize / previewLayout.height
    );

    return (
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center"
        style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: `${previewLayout.width}px`,
            height: `${previewLayout.height}px`,
          }}
        >
          <ComponentRenderer schema={previewLayout} context={context} />
        </div>
      </div>
    );
  };

  const stats = getLayoutStats();

  return (
    <div>
      <div className="bg-white rounded-3xl border-3 border-black shadow-sm">
        {/* Toolbar */}
        <div className="p-10 border-b-3 border-black">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="dof-title mb-3">COMPONENT LAYOUTS</h2>
              <p className="dof-body-sm">
                Create layouts using JSON schemas • {stats.totalLayouts} layouts • {(stats.dataSize / 1024).toFixed(1)}KB used
              </p>
            </div>

            <div className="flex gap-4">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-component-layouts"
              />
              <button
                onClick={() => document.getElementById('import-component-layouts')?.click()}
                className="dof-btn dof-btn-outline"
              >
                <Upload size={18} />
                Import
              </button>
              <button
                onClick={handleExport}
                disabled={componentLayouts.length === 0}
                className="dof-btn dof-btn-outline"
              >
                <Download size={18} />
                Export
              </button>
              <button onClick={handleNewLayout} className="dof-btn dof-btn-coral">
                <Plus size={18} />
                NEW LAYOUT
              </button>
            </div>
          </div>
        </div>

        {/* Layouts List */}
        <div className="p-10">
          {componentLayouts.length === 0 ? (
            <div>
              <div className="text-center py-12 mb-12 border-b-[3px] border-black">
                <Code className="h-20 w-20 mx-auto mb-6 text-gray-200 stroke-[1.5]" />
                <h3 className="dof-title mb-4">NO COMPONENT LAYOUTS YET</h3>
                <p className="dof-body mb-8">
                  {QUICK_START_TEMPLATES.length > 0
                    ? 'Start from a template or create from scratch'
                    : 'Create your first component layout'}
                </p>
              </div>

              {/* Quick Start Templates (if available) */}
              {QUICK_START_TEMPLATES.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-6 w-6" style={{ color: '#FF6B5A' }} />
                    <h3 className="dof-subtitle">QUICK START TEMPLATES</h3>
                  </div>
                  <div className="dof-grid dof-grid-2">
                    {QUICK_START_TEMPLATES.map((template) => (
                      <div key={template.id} className="dof-card">
                        <div className="mb-6">
                          <h4 className="dof-subtitle mb-2">{template.name}</h4>
                          <p className="dof-body-sm text-gray-600">{template.description}</p>
                        </div>
                        <button
                          className="dof-btn dof-btn-black w-full"
                          onClick={() => handleLoadTemplate(template.id)}
                        >
                          <Plus size={16} />
                          Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create from Scratch */}
              <div className={`text-center ${QUICK_START_TEMPLATES.length > 0 ? 'pt-8 border-t-[3px] border-black' : 'pt-0'}`}>
                <button onClick={handleNewLayout} className="dof-btn dof-btn-coral dof-btn-lg">
                  <Code size={24} />
                  CREATE FROM SCRATCH
                </button>
              </div>
            </div>
          ) : (
            <div className="dof-grid dof-grid-3">
              {componentLayouts.map((layout) => (
                <div key={layout.id} className="dof-card">
                  <div className="mb-8">
                    <h3 className="dof-subtitle mb-3">{layout.name}</h3>
                    <p className="dof-body-sm line-clamp-2 mb-4">
                      {layout.description || 'No description'}
                    </p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>{layout.width}×{layout.height}px</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      className="px-4 py-2 border-[3px] border-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                      onClick={() => handlePreview(layout)}
                    >
                      <Eye className="inline h-3 w-3 mr-1" />
                      PREVIEW
                    </button>
                    <button
                      className="px-4 py-2 border-[3px] border-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                      onClick={() => handleEditLayout(layout)}
                    >
                      <Edit className="inline h-3 w-3 mr-1" />
                      EDIT
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="px-4 py-2 border-[3px] border-blue-600 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors"
                      onClick={() => handleDuplicateLayout(layout.id)}
                    >
                      <Copy className="inline h-3 w-3 mr-1" />
                      DUPLICATE
                    </button>
                    <button
                      className="px-4 py-2 border-[3px] border-red-600 text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-colors"
                      onClick={() => handleDeleteLayout(layout.id)}
                    >
                      <Trash2 className="inline h-3 w-3 mr-1" />
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="!w-[95vw] !max-w-[2000px] h-[92vh] p-0 flex flex-col border-4 border-black rounded-3xl overflow-hidden">
          {/* Compact Header */}
          <div className="px-8 py-5 border-b-3 border-black flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold">
              {editingLayout ? 'EDIT COMPONENT LAYOUT' : 'NEW COMPONENT LAYOUT'}
            </h2>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditorOpen(false)}
                className="px-6 py-2 text-sm font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveLayout}
                className="px-6 py-2 text-sm font-bold"
              >
                {editingLayout ? 'Save Changes' : 'Create Layout'}
              </Button>
            </div>
          </div>

          {/* Main Content - Full Height */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left Sidebar - 40% width */}
            <div className="w-[40%] border-r-3 border-black p-5 overflow-y-auto flex-shrink-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase">
                    Layout Name *
                  </label>
                  <Input
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                    placeholder="e.g., Bold Quote Card"
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase">
                    Description
                  </label>
                  <Textarea
                    value={layoutDescription}
                    onChange={(e) => setLayoutDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={2}
                    className="text-sm"
                  />
                </div>

                {/* AI Assistant - Compact */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-600 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-3 w-3 text-purple-800" />
                    <h4 className="text-xs font-bold text-purple-900">AI Generation</h4>
                  </div>
                  <button
                    onClick={() => {
                      const prompt = `Create a JSON component layout for a 1080x1080 social media slide. Use this schema: root container with display:flex, children array with text/heading/shape components. Include template variables like {{title}}, {{quote}}, {{background_color}}. Example: centered quote card with large quote text, decorative line, and attribution. Return only valid JSON.`;
                      navigator.clipboard.writeText(prompt);
                      toast.success('Prompt copied! Paste into ChatGPT or Claude.');
                    }}
                    className="w-full px-2 py-1.5 bg-purple-800 text-white border border-purple-900 rounded text-xs font-bold hover:bg-purple-900 transition-colors"
                  >
                    <Copy className="inline h-2.5 w-2.5 mr-1" />
                    COPY PROMPT
                  </button>
                </div>

                {/* Quick Start Templates - Compact */}
                {QUICK_START_TEMPLATES.length > 0 && !editingLayout && (
                  <div className="bg-blue-50 border-2 border-black rounded-xl p-3">
                    <h4 className="text-xs font-bold mb-2">QUICK START</h4>
                    <div className="space-y-1.5">
                      {QUICK_START_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleLoadTemplate(template.id)}
                          className="w-full text-left px-2 py-1.5 bg-white border border-black rounded text-xs hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-bold">{template.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Code Editor FULL HEIGHT (60% width) */}
            <div className="w-[60%] flex flex-col min-h-0 p-5 flex-shrink-0">
              <CodeEditorPanel
                title="Schema Editor (JSON)"
                language="json"
                value={schemaCode}
                onChange={setSchemaCode}
                hint="Monaco Editor • Ctrl+Space for autocomplete"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[900px]">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold mb-2">
              {previewLayout?.name}
            </DialogTitle>
            <DialogDescription className="text-base">
              {previewLayout?.description || 'Layout preview with sample data'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-10">
            {renderPreview()}
          </div>

          <DialogFooter className="pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPreviewOpen(false)}
              className="px-6 py-3 text-base font-bold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="border-4 border-black rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase">
              DELETE LAYOUT
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete this component layout? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="dof-btn dof-btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteLayout}
              className="dof-btn dof-btn-coral"
            >
              <Trash2 size={18} />
              Delete Layout
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
