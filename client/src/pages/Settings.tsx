import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Editor from '@monaco-editor/react';
import DOMPurify from 'isomorphic-dompurify';
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
              <div className="mb-6">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">go round</span>
              </div>
              <h1 className="dof-huge-title mb-3">
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border-4 border-black rounded-3xl">
          <DialogHeader>
            <DialogTitle className="dof-title">
              {editingLayout ? 'EDIT CUSTOM LAYOUT' : 'CREATE CUSTOM LAYOUT'}
            </DialogTitle>
            <DialogDescription className="dof-body-sm">
              Use HTML and CSS to create your custom slide layout. Use template variables like {'{{title}}'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 mb-8">
              <div>
                <label className="dof-body-sm font-bold mb-3 block">
                  LAYOUT NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bold Quote Layout"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  className="dof-input"
                />
              </div>

              <div>
                <label className="dof-body-sm font-bold mb-3 block">
                  DESCRIPTION
                </label>
                <textarea
                  placeholder="Describe what this layout is for..."
                  value={layoutDescription}
                  onChange={(e) => setLayoutDescription(e.target.value)}
                  rows={2}
                  className="dof-input"
                />
              </div>
            </div>

            {/* Template Variables Info */}
            <div className="bg-blue-50 border-3 border-black rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-black mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="dof-subtitle mb-6">AVAILABLE TEMPLATE VARIABLES</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {TEMPLATE_VARIABLES.map((variable) => (
                      <div key={variable.name} className="flex items-start gap-3">
                        <code className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                          {variable.name}
                        </code>
                        <span className="dof-body-sm">{variable.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="dof-body-sm font-bold mb-4 block">
                  HTML TEMPLATE *
                </label>
                <div className="border-3 border-black rounded-2xl overflow-hidden">
                  <Editor
                    height="300px"
                    defaultLanguage="html"
                    value={htmlCode}
                    onChange={(value) => setHtmlCode(value || '')}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="dof-body-sm font-bold mb-4 block">
                  CSS TEMPLATE
                </label>
                <div className="border-3 border-black rounded-2xl overflow-hidden">
                  <Editor
                    height="300px"
                    defaultLanguage="css"
                    value={cssCode}
                    onChange={(value) => setCssCode(value || '')}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-4">
            <button onClick={() => setEditorOpen(false)} className="dof-btn dof-btn-outline">
              Cancel
            </button>
            <button onClick={handleSaveLayout} className="dof-btn dof-btn-green">
              {editingLayout ? 'UPDATE LAYOUT' : 'CREATE LAYOUT'}
            </button>
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
