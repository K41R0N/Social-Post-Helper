import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import DOMPurify from 'isomorphic-dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CodeEditorPanel from '../components/CodeEditorPanel';
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
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Code,
  Info,
} from 'lucide-react';
import FontsSettings from '../components/FontsSettings';
import ComponentLayoutsSettings from '../components/ComponentLayoutsSettings';
import {
  getAllCustomLayouts,
  createCustomLayout,
  deleteCustomLayout,
  saveCustomLayout,
  exportCustomLayouts,
  importCustomLayouts,
  seedAntiMarketingLayouts,
  TEMPLATE_VARIABLES,
  DEFAULT_HTML_TEMPLATE,
  DEFAULT_CSS_TEMPLATE,
} from '../lib/customLayoutStorage';
import type { CustomLayout } from '../types/customLayout';

export default function Settings() {
  const [, setLocation] = useLocation();
  const [customLayouts, setCustomLayouts] = useState<CustomLayout[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<CustomLayout | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<CustomLayout | null>(null);

  // Form state
  const [layoutName, setLayoutName] = useState('');
  const [layoutDescription, setLayoutDescription] = useState('');
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML_TEMPLATE);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS_TEMPLATE);

  useEffect(() => {
    loadCustomLayouts();
  }, []);

  const loadCustomLayouts = () => {
    seedAntiMarketingLayouts();
    const layouts = getAllCustomLayouts();
    setCustomLayouts(layouts);
  };

  const handleNewLayout = () => {
    setEditingLayout(null);
    setLayoutName('');
    setLayoutDescription('');
    setHtmlCode(DEFAULT_HTML_TEMPLATE);
    setCssCode(DEFAULT_CSS_TEMPLATE);
    setEditorOpen(true);
  };

  const handleEditLayout = (layout: CustomLayout) => {
    setEditingLayout(layout);
    setLayoutName(layout.name);
    setLayoutDescription(layout.description);
    setHtmlCode(layout.htmlTemplate);
    setCssCode(layout.cssTemplate);
    setEditorOpen(true);
  };

  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    if (!htmlCode.trim()) {
      toast.error('HTML template cannot be empty');
      return;
    }

    try {
      if (editingLayout) {
        const updated: CustomLayout = {
          ...editingLayout,
          name: layoutName.trim(),
          description: layoutDescription.trim(),
          htmlTemplate: htmlCode,
          cssTemplate: cssCode,
        };
        saveCustomLayout(updated);
        toast.success('Layout updated!');
      } else {
        createCustomLayout(
          layoutName.trim(),
          layoutDescription.trim(),
          htmlCode,
          cssCode
        );
        toast.success('Layout created!');
      }

      loadCustomLayouts();
      setEditorOpen(false);
    } catch (error) {
      toast.error('Failed to save layout');
    }
  };

  const handleDeleteLayout = (id: string, name: string) => {
    if (!confirm(`Delete layout "${name}"? This cannot be undone.`)) return;

    try {
      deleteCustomLayout(id);
      loadCustomLayouts();
      toast.success('Layout deleted');
    } catch (error) {
      toast.error('Failed to delete layout');
    }
  };

  const handlePreview = (layout: CustomLayout) => {
    setPreviewLayout(layout);
    setPreviewOpen(true);
  };

  const handleExport = () => {
    const json = exportCustomLayouts();
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'custom-layouts.json';
    link.click();
    toast.success('Custom layouts exported!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const count = importCustomLayouts(json);
        loadCustomLayouts();
        toast.success(`Imported ${count} layout(s)!`);
      } catch (error) {
        toast.error('Failed to import layouts');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const renderPreview = (layout: CustomLayout) => {
    const sampleData = {
      title: 'Sample Title',
      subtitle: 'Sample Subtitle',
      body_text: 'This is sample body text to demonstrate how your layout looks.',
      quote: 'Sample quote text',
      background_color: '#f4f1ee',
      font_color: '#1a1a1a',
      accent_color: '#B8312F',
      image_url: '',
    };

    let html = layout.htmlTemplate;
    let css = layout.cssTemplate;

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value);
      css = css.replace(regex, value);
    });

    // Sanitize HTML to prevent XSS attacks
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'span', 'strong', 'em', 'u', 'br', 'hr',
        'ul', 'ol', 'li', 'a', 'img',
        'section', 'article', 'header', 'footer', 'main'
      ],
      ALLOWED_ATTR: [
        'class', 'style', 'id', 'href', 'src', 'alt', 'title',
        'target', 'rel', 'data-*'
      ],
      ALLOW_DATA_ATTR: true
    });

    return (
      <div className="w-full h-full">
        <style>{css}</style>
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setLocation('/dashboard')}
                className="dof-btn dof-btn-outline mb-6"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
              <h1 className="dof-huge-title mb-6">
                SETTINGS
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-16">
        <Tabs defaultValue="layouts" className="w-full">
          <TabsList className="mb-10 bg-gray-100 p-2 rounded-full border-3 border-black">
            <TabsTrigger
              value="layouts"
              className="rounded-full px-10 py-3.5 font-bold uppercase text-sm data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Custom Layouts
            </TabsTrigger>
            <TabsTrigger
              value="component-layouts"
              className="rounded-full px-10 py-3.5 font-bold uppercase text-sm data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Component Layouts
            </TabsTrigger>
            <TabsTrigger
              value="fonts"
              className="rounded-full px-10 py-3.5 font-bold uppercase text-sm data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Fonts
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className="rounded-full px-10 py-3.5 font-bold uppercase text-sm data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layouts">
            <div className="bg-white rounded-3xl border-3 border-black shadow-sm">
              {/* Toolbar */}
              <div className="p-10 border-b-3 border-black">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="dof-title mb-3">CUSTOM LAYOUT TYPES</h2>
                    <p className="dof-body-sm">
                      Create custom slide layouts using HTML and CSS
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                      id="import-layouts"
                    />
                    <button
                      onClick={() => document.getElementById('import-layouts')?.click()}
                      disabled={customLayouts.length === 0}
                      className="dof-btn dof-btn-outline"
                    >
                      <Upload size={18} />
                      Import
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={customLayouts.length === 0}
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
                {customLayouts.length === 0 ? (
                  <div className="text-center py-20">
                    <Code className="h-24 w-24 mx-auto mb-8 text-gray-200 stroke-[1.5]" />
                    <h3 className="dof-title mb-4">
                      NO CUSTOM LAYOUTS YET
                    </h3>
                    <p className="dof-body mb-10">
                      Create your first custom layout to get started
                    </p>
                    <button onClick={handleNewLayout} className="dof-btn dof-btn-black dof-btn-lg">
                      <Plus size={24} />
                      CREATE LAYOUT
                    </button>
                  </div>
                ) : (
                  <div className="dof-grid dof-grid-3">
                    {customLayouts.map((layout) => (
                      <div
                        key={layout.id}
                        className="dof-card"
                      >
                        <div className="mb-8">
                          <h3 className="dof-subtitle mb-3">
                            {layout.name}
                          </h3>
                          <p className="dof-body-sm line-clamp-2 mb-4">
                            {layout.description || 'No description'}
                          </p>
                        </div>

                        <div className="flex gap-3 mb-5">
                          <button
                            className="flex-1 px-5 py-2.5 border-2 border-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                            onClick={() => handlePreview(layout)}
                          >
                            <Eye className="inline h-3 w-3 mr-1" />
                            PREVIEW
                          </button>
                          <button
                            className="flex-1 px-5 py-2.5 border-2 border-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
                            onClick={() => handleEditLayout(layout)}
                          >
                            <Edit className="inline h-3 w-3 mr-1" />
                            EDIT
                          </button>
                          <button
                            className="px-5 py-2.5 border-2 border-red-600 text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-colors"
                            onClick={() => handleDeleteLayout(layout.id, layout.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="pt-5 border-t-2 border-gray-200 dof-body-sm text-gray-500">
                          Modified {new Date(layout.modifiedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="component-layouts">
            <ComponentLayoutsSettings />
          </TabsContent>

          <TabsContent value="fonts">
            <FontsSettings />
          </TabsContent>

          <TabsContent value="general">
            <div className="bg-white rounded-3xl border-3 border-black shadow-sm p-10">
              <h2 className="dof-title mb-6">GENERAL SETTINGS</h2>
              <p className="dof-body">General settings coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Layout Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="!w-[95vw] !max-w-[2000px] h-[92vh] p-0 flex flex-col border-4 border-black rounded-3xl">
          <DialogHeader className="px-10 pt-10 pb-8 border-b-3 border-black flex-shrink-0">
            <DialogTitle className="text-2xl font-bold mb-4">
              {editingLayout ? 'EDIT CUSTOM LAYOUT' : 'CREATE CUSTOM LAYOUT'}
            </DialogTitle>
            <DialogDescription className="text-base">
              Use HTML and CSS to create your custom slide layout
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Left Sidebar - Form Fields */}
            <div className="w-[22%] border-r-3 border-black p-8 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">
                    Layout Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Bold Quote Layout"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                    className="h-11 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">
                    Description
                  </label>
                  <Textarea
                    placeholder="Describe what this layout is for..."
                    value={layoutDescription}
                    onChange={(e) => setLayoutDescription(e.target.value)}
                    rows={3}
                    className="text-base"
                  />
                </div>

                {/* Template Variables Info */}
                <div className="bg-blue-50 border-3 border-black rounded-2xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="h-4 w-4 text-black mt-0.5 flex-shrink-0" />
                    <h4 className="text-xs font-bold uppercase">Available Template Variables</h4>
                  </div>
                  <div className="space-y-2">
                    {TEMPLATE_VARIABLES.map((variable) => (
                      <div key={variable.name} className="flex flex-col gap-1">
                        <code className="bg-black text-white px-2 py-1 rounded-full text-xs font-bold inline-block w-fit">
                          {variable.name}
                        </code>
                        <span className="text-xs text-gray-700">{variable.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Code Editors with Tabs */}
            <div className="flex-1 flex flex-col min-h-0">
              <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0">
                <TabsList className="mx-10 mt-10 bg-gray-100 p-2 rounded-full border-3 border-black flex-shrink-0">
                  <TabsTrigger
                    value="html"
                    className="rounded-full px-10 py-3 font-bold uppercase text-sm data-[state=active]:bg-black data-[state=active]:text-white transition-all"
                  >
                    HTML Template
                  </TabsTrigger>
                  <TabsTrigger
                    value="css"
                    className="rounded-full px-10 py-3 font-bold uppercase text-sm data-[state=active]:bg-black data-[state=active]:text-white transition-all"
                  >
                    CSS Template
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="html" className="flex-1 px-10 pb-10 pt-6 min-h-0">
                  <CodeEditorPanel
                    title="HTML Editor"
                    language="html"
                    value={htmlCode}
                    onChange={setHtmlCode}
                  />
                </TabsContent>

                <TabsContent value="css" className="flex-1 px-10 pb-10 pt-6 min-h-0">
                  <CodeEditorPanel
                    title="CSS Editor"
                    language="css"
                    value={cssCode}
                    onChange={setCssCode}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter className="px-10 py-6 border-t-3 border-black flex-shrink-0">
            <div className="flex gap-4 w-full justify-end">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setEditorOpen(false)}
                className="px-8 py-4 text-base font-bold"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleSaveLayout}
                className="px-8 py-4 text-base font-bold bg-green-600 hover:bg-green-700"
              >
                {editingLayout ? 'UPDATE LAYOUT' : 'CREATE LAYOUT'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl border-4 border-black rounded-3xl">
          <DialogHeader>
            <DialogTitle className="dof-title">
              PREVIEW: {previewLayout?.name}
            </DialogTitle>
            <DialogDescription className="dof-body-sm">
              Preview with sample data (1080×1080px)
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center p-10 bg-gray-100 rounded-2xl">
            <div
              className="bg-white shadow-2xl border-3 border-black"
              style={{
                width: '540px',
                height: '540px',
                transform: 'scale(1)',
              }}
            >
              {previewLayout && renderPreview(previewLayout)}
            </div>
          </div>

          <DialogFooter>
            <button onClick={() => setPreviewOpen(false)} className="dof-btn dof-btn-black">
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
