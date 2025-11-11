import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Upload,
  Trash2,
  Search,
  Type,
  Check,
} from 'lucide-react';
import {
  getAllCustomFonts,
  uploadFont,
  deleteCustomFont,
  getFontSettings,
  saveFontSettings,
  addGoogleFont,
  injectCustomFonts,
  injectGoogleFonts,
} from '../lib/fontStorage';
import { updateGlobalFonts } from '../lib/injectFontStyles';
import { fetchGoogleFonts, searchGoogleFonts, getFontPreviewUrl } from '../lib/googleFonts';
import type { CustomFont, GoogleFont, FontSettings } from '../types/font';

export default function FontsSettings() {
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [fontSettings, setFontSettings] = useState<FontSettings>(getFontSettings());
  const [googleFontsDialogOpen, setGoogleFontsDialogOpen] = useState(false);
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFonts, setFilteredFonts] = useState<GoogleFont[]>([]);
  const [loadingGoogleFonts, setLoadingGoogleFonts] = useState(false);

  useEffect(() => {
    loadCustomFonts();
  }, []);

  const loadCustomFonts = () => {
    const fonts = getAllCustomFonts();
    setCustomFonts(fonts);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadFont(file);
      loadCustomFonts();
      injectCustomFonts();
      toast.success(`Font "${file.name}" uploaded!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload font');
    }

    event.target.value = '';
  };

  const handleDeleteFont = (id: string, name: string) => {
    if (!confirm(`Delete font "${name}"? This cannot be undone.`)) return;

    try {
      deleteCustomFont(id);
      loadCustomFonts();
      injectCustomFonts();
      toast.success('Font deleted');
    } catch (error) {
      toast.error('Failed to delete font');
    }
  };

  const handleFontSettingChange = (type: keyof FontSettings, value: string) => {
    const updated = { ...fontSettings, [type]: value };
    setFontSettings(updated);
    saveFontSettings(updated);
    updateGlobalFonts();
    toast.success('Font setting updated');
  };

  const handleOpenGoogleFonts = async () => {
    setGoogleFontsDialogOpen(true);
    setLoadingGoogleFonts(true);
    
    try {
      const fonts = await fetchGoogleFonts();
      setGoogleFonts(fonts);
      setFilteredFonts(fonts.slice(0, 50));
    } catch (error) {
      toast.error('Failed to load Google Fonts');
    } finally {
      setLoadingGoogleFonts(false);
    }
  };

  const handleSearchGoogleFonts = (query: string) => {
    setSearchQuery(query);
    const filtered = searchGoogleFonts(query, googleFonts);
    setFilteredFonts(filtered);
  };

  const handleAddGoogleFont = (family: string) => {
    addGoogleFont(family);
    injectGoogleFonts();
    toast.success(`Added "${family}" from Google Fonts`);
    
    // Reload font settings to update dropdowns
    setFontSettings(getFontSettings());
  };

  const getAllAvailableFonts = (): string[] => {
    const customFontFamilies = customFonts.map(f => f.family);
    const googleFontFamilies = fontSettings.googleFonts;
    const defaultFonts = [
      "'Roboto', sans-serif",
      "'Merriweather', serif",
      "Arial, sans-serif",
      "Georgia, serif",
      "Times New Roman, serif",
      "Courier New, monospace",
    ];
    
    return [...defaultFonts, ...customFontFamilies.map(f => `'${f}'`), ...googleFontFamilies.map(f => `'${f}'`)];
  };

  return (
    <div className="space-y-8">
      {/* Font Assignment */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Font Assignment</h2>
        <p className="text-gray-600 mb-6">
          Assign fonts to different text types across all layouts
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Heading Font
            </label>
            <Select
              value={fontSettings.headingFont}
              onValueChange={(value) => handleFontSettingChange('headingFont', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllAvailableFonts().map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Body Font
            </label>
            <Select
              value={fontSettings.bodyFont}
              onValueChange={(value) => handleFontSettingChange('bodyFont', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllAvailableFonts().map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Accent Font
            </label>
            <Select
              value={fontSettings.accentFont}
              onValueChange={(value) => handleFontSettingChange('accentFont', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllAvailableFonts().map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Custom Fonts */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Custom Fonts</h2>
              <p className="text-gray-600">
                Upload your own font files (TTF, OTF, WOFF, WOFF2)
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileUpload}
                className="hidden"
                id="font-upload"
              />
              <Button
                onClick={() => document.getElementById('font-upload')?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Font
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {customFonts.length === 0 ? (
            <div className="text-center py-12">
              <Type className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No custom fonts yet
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your brand fonts to use them in your carousels
              </p>
              <Button
                onClick={() => document.getElementById('font-upload')?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Font
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFonts.map((font) => (
                <div
                  key={font.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {font.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {font.format.toUpperCase()} • {new Date(font.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteFont(font.id, font.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div
                    className="text-2xl p-4 bg-gray-50 rounded-lg"
                    style={{ fontFamily: `'${font.family}'` }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Google Fonts */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Google Fonts</h2>
            <p className="text-gray-600">
              Browse and add fonts from Google Fonts library
            </p>
          </div>

          <Button onClick={handleOpenGoogleFonts} className="bg-blue-600 hover:bg-blue-700">
            <Search className="mr-2 h-4 w-4" />
            Browse Google Fonts
          </Button>
        </div>

        {fontSettings.googleFonts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Google Fonts</h3>
            <div className="flex flex-wrap gap-2">
              {fontSettings.googleFonts.map((family) => (
                <div
                  key={family}
                  className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  <Check className="h-3 w-3" />
                  {family}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Google Fonts Browser Dialog */}
      <Dialog open={googleFontsDialogOpen} onOpenChange={setGoogleFontsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Browse Google Fonts</DialogTitle>
            <DialogDescription>
              Search and add fonts from Google's free font library
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search fonts..."
                value={searchQuery}
                onChange={(e) => handleSearchGoogleFonts(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingGoogleFonts ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading fonts...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredFonts.map((font) => (
                  <div
                    key={font.family}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all duration-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{font.family}</h4>
                      <p
                        className="text-2xl"
                        style={{ fontFamily: `'${font.family}'` }}
                      >
                        The quick brown fox jumps
                      </p>
                      <link rel="stylesheet" href={getFontPreviewUrl(font.family)} />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddGoogleFont(font.family)}
                      disabled={fontSettings.googleFonts.includes(font.family)}
                      className="ml-4"
                    >
                      {fontSettings.googleFonts.includes(font.family) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Added
                        </>
                      ) : (
                        'Add Font'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setGoogleFontsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
