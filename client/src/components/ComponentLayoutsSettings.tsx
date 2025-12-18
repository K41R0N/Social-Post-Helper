import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');

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
    setEditorMode('visual');
    setEditorOpen(true);
  };

  const handleEditLayout = (layout: LayoutSchema) => {
    setEditingLayout(layout);
    setLayoutName(layout.name);
    setLayoutDescription(layout.description || '');
    setSchemaCode(JSON.stringify(layout, null, 2));
    setEditorMode('code');
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
        id: editingLayout?.id || `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: layoutName,
        description: layoutDescription,
        updatedAt: Date.now(),
        createdAt: editingLayout?.createdAt || Date.now(),
      };

      // Validate schema has required fields
      if (!layout.root || !layout.width || !layout.height) {
        toast.error('Invalid schema: missing root, width, or height');
        return;
      }

      saveComponentLayout(layout);
      loadComponentLayouts();
      setEditorOpen(false);
      toast.success(editingLayout ? 'Layout updated' : 'Layout created');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Invalid JSON schema');
    }
  };

  const handleDeleteLayout = (id: string) => {
    if (confirm('Are you sure you want to delete this layout?')) {
      deleteComponentLayout(id);
      loadComponentLayouts();
      toast.success('Layout deleted');
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
        const imported = importLayoutFromJSON(content);
        saveComponentLayout(imported);
        loadComponentLayouts();
        toast.success('Layout imported');
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import layout');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = QUICK_START_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setLayoutName(template.name);
    setLayoutDescription(template.description);
    setSchemaCode(JSON.stringify(template.schema, null, 2));
    setEditingLayout(null);
    setEditorMode('visual');
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

    return (
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ width: '540px', height: '540px' }}
      >
        <ComponentRenderer schema={previewLayout} context={context} />
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
          {componentLayouts.length === 0 && QUICK_START_TEMPLATES.length > 0 ? (
            <div>
              <div className="text-center py-12 mb-12 border-b-2 border-gray-200">
                <Code className="h-20 w-20 mx-auto mb-6 text-gray-200 stroke-[1.5]" />
                <h3 className="dof-title mb-4">NO COMPONENT LAYOUTS YET</h3>
                <p className="dof-body mb-8">
                  Start from a template or create from scratch
                </p>
              </div>

              {/* Quick Start Templates */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-6 w-6 text-coral" />
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

              {/* Create from Scratch */}
              <div className="text-center pt-8 border-t-2 border-gray-200">
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
                      className="px-4 py-2 border-2 border-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                      onClick={() => handlePreview(layout)}
                    >
                      <Eye className="inline h-3 w-3 mr-1" />
                      PREVIEW
                    </button>
                    <button
                      className="px-4 py-2 border-2 border-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                      onClick={() => handleEditLayout(layout)}
                    >
                      <Edit className="inline h-3 w-3 mr-1" />
                      EDIT
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-50 transition-colors"
                      onClick={() => handleDuplicateLayout(layout.id)}
                    >
                      <Copy className="inline h-3 w-3 mr-1" />
                      DUPLICATE
                    </button>
                    <button
                      className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-colors"
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
        <DialogContent className="max-w-[95vw] h-[92vh] p-0">
          <DialogHeader className="px-8 pt-8 pb-6 border-b">
            <DialogTitle className="text-2xl font-bold">
              {editingLayout ? 'Edit Layout' : 'New Component Layout'}
            </DialogTitle>
            <DialogDescription className="text-base">
              Create layouts using JSON schemas with visual components
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col px-8">
            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Layout Name</label>
                <Input
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  placeholder="e.g., Bold Quote Card"
                  className="h-11"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <Input
                  value={layoutDescription}
                  onChange={(e) => setLayoutDescription(e.target.value)}
                  placeholder="e.g., Quote with large typography"
                  className="h-11"
                />
              </div>
            </div>

            {/* Schema Editor */}
            <div className="flex-1 border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-semibold">Schema Editor (JSON)</span>
                <div className="flex gap-2">
                  <span className="text-xs text-gray-500">Monaco Editor</span>
                </div>
              </div>
              <Editor
                height="100%"
                defaultLanguage="json"
                value={schemaCode}
                onChange={(value) => setSchemaCode(value || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
          </div>

          <DialogFooter className="px-8 py-6 border-t gap-3">
            <Button variant="outline" size="lg" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button size="lg" onClick={handleSaveLayout}>
              {editingLayout ? 'Save Changes' : 'Create Layout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {previewLayout?.name}
            </DialogTitle>
            <DialogDescription>
              {previewLayout?.description || 'Layout preview'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-8">
            {renderPreview()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
