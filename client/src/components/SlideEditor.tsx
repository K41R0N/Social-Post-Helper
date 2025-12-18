import { useState, useEffect } from 'react';
import { getAllCustomLayouts } from '../lib/customLayoutStorage';
import type { SlideData, LayoutType } from '../types/carousel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SlideEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (slide: SlideData) => void;
  slide?: SlideData;
  carouselId: string;
  nextSlideNumber: number;
}

const LAYOUT_TYPES: { value: LayoutType; label: string }[] = [
  { value: 'dictionary_entry', label: 'Dictionary Entry' },
  { value: 'minimalist_focus', label: 'Minimalist Focus' },
  { value: 'bold_callout', label: 'Bold Callout' },
  { value: 'header_body', label: 'Header & Body' },
  { value: 'quote_highlight', label: 'Quote Highlight' },
  { value: 'list_layout', label: 'List Layout' },
  { value: 'stat_showcase', label: 'Stat Showcase' },
  { value: 'split_content', label: 'Split Content' },
  { value: 'image_overlay', label: 'Image Overlay' },
  { value: 'two_part_vertical', label: 'Two Part Vertical' },
  { value: 'anti_marketing_hook', label: 'Anti Marketing Hook' },
  { value: 'anti_marketing_content', label: 'Anti Marketing Content' },
  { value: 'anti_marketing_cta', label: 'Anti Marketing CTA' },
];

export default function SlideEditor({
  open,
  onClose,
  onSave,
  slide,
  carouselId,
  nextSlideNumber,
}: SlideEditorProps) {
  const customLayouts = getAllCustomLayouts();
  const allLayoutTypes = [
    ...LAYOUT_TYPES,
    ...customLayouts.map(l => ({
      value: `custom-${l.id}` as LayoutType,
      label: `${l.name} (Custom)`,
    })),
  ];
  const [formData, setFormData] = useState<SlideData>({
    carousel_id: carouselId,
    slide_number: nextSlideNumber,
    layout_type: 'header_body',
    background_color: '#ffffff',
    font_color: '#000000',
    accent_color: '#3b82f6',
    title: '',
    body_text: '',
    subtitle: '',
    quote: '',
    image_url: '',
  });

  useEffect(() => {
    if (slide) {
      setFormData(slide);
    } else {
      setFormData({
        carousel_id: carouselId,
        slide_number: nextSlideNumber,
        layout_type: 'header_body',
        background_color: '#ffffff',
        font_color: '#000000',
        accent_color: '#3b82f6',
        title: '',
        body_text: '',
        subtitle: '',
        quote: '',
        image_url: '',
      });
    }
  }, [slide, carouselId, nextSlideNumber, open]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const updateField = (field: keyof SlideData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">{slide ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
          <DialogDescription className="text-base">
            Configure the slide properties and content
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          {/* Slide Number */}
          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="slide_number" className="text-right font-semibold">
              Slide #
            </Label>
            <Input
              id="slide_number"
              type="number"
              value={formData.slide_number}
              onChange={(e) => updateField('slide_number', parseInt(e.target.value))}
              className="col-span-3 h-11"
            />
          </div>

          {/* Layout Type */}
          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="layout_type" className="text-right font-semibold">
              Layout
            </Label>
            <Select
              value={formData.layout_type}
              onValueChange={(value) => updateField('layout_type', value)}
            >
              <SelectTrigger className="col-span-3 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allLayoutTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="background_color" className="text-right font-semibold">
              Background
            </Label>
            <div className="col-span-3 flex gap-3">
              <Input
                id="background_color"
                type="color"
                value={formData.background_color}
                onChange={(e) => updateField('background_color', e.target.value)}
                className="w-24 h-11"
              />
              <Input
                type="text"
                value={formData.background_color}
                onChange={(e) => updateField('background_color', e.target.value)}
                className="flex-1 h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="font_color" className="text-right font-semibold">
              Text Color
            </Label>
            <div className="col-span-3 flex gap-3">
              <Input
                id="font_color"
                type="color"
                value={formData.font_color}
                onChange={(e) => updateField('font_color', e.target.value)}
                className="w-24 h-11"
              />
              <Input
                type="text"
                value={formData.font_color}
                onChange={(e) => updateField('font_color', e.target.value)}
                className="flex-1 h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="accent_color" className="text-right font-semibold">
              Accent Color
            </Label>
            <div className="col-span-3 flex gap-3">
              <Input
                id="accent_color"
                type="color"
                value={formData.accent_color}
                onChange={(e) => updateField('accent_color', e.target.value)}
                className="w-24 h-11"
              />
              <Input
                type="text"
                value={formData.accent_color}
                onChange={(e) => updateField('accent_color', e.target.value)}
                className="flex-1 h-11"
              />
            </div>
          </div>

          {/* Content Fields */}
          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="title" className="text-right font-semibold">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="col-span-3 h-11"
              placeholder="Main heading"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-6">
            <Label htmlFor="body_text" className="text-right pt-3 font-semibold">
              Body Text
            </Label>
            <Textarea
              id="body_text"
              value={formData.body_text || ''}
              onChange={(e) => updateField('body_text', e.target.value)}
              className="col-span-3 min-h-[120px]"
              rows={5}
              placeholder="Main content (use <br /><br /> for paragraph breaks)"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="subtitle" className="text-right font-semibold">
              Subtitle
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className="col-span-3 h-11"
              placeholder="Secondary text"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-6">
            <Label htmlFor="quote" className="text-right pt-3 font-semibold">
              Quote
            </Label>
            <Textarea
              id="quote"
              value={formData.quote || ''}
              onChange={(e) => updateField('quote', e.target.value)}
              className="col-span-3 min-h-[100px]"
              rows={4}
              placeholder="Quote or etymology text"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="image_url" className="text-right font-semibold">
              Image URL
            </Label>
            <Input
              id="image_url"
              value={formData.image_url || ''}
              onChange={(e) => updateField('image_url', e.target.value)}
              className="col-span-3 h-11"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={handleSave}>
            {slide ? 'Save Changes' : 'Add Slide'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
