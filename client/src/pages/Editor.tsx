import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { parseCarouselCSV, validateSlideData } from '../lib/csvParser';
import type { CarouselData, SlideData, LayoutType } from '../types/carousel';
import type { Project } from '../types/project';
import LayoutRenderer from '../components/LayoutRenderer';
import SlideEditor from '../components/SlideEditor';
import LayoutExplorer from '../components/LayoutExplorer';
import { PanZoomCanvas } from '../components/PanZoomCanvas';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Upload, Download, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
  FileDown, Sparkles, GripVertical, Monitor, ArrowLeft, Palette
} from 'lucide-react';
import { EXPORT_PRESETS, type ExportPreset, getDefaultPreset } from '../lib/exportPresets';
import { CAROUSEL_TEMPLATES } from '../lib/carouselTemplates';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getProject, saveProject } from '../lib/projectStorage';

export default function Editor() {
  const params = useParams<{ projectId: string }>();
  const [, setLocation] = useLocation();
  const projectId = params.projectId || '';
  
  const [project, setProject] = useState<Project | null>(null);
  const [carousels, setCarousels] = useState<CarouselData[]>([]);
  const [selectedCarouselIndex, setSelectedCarouselIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPreset, setExportPreset] = useState<ExportPreset>(getDefaultPreset());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideData | undefined>();
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [layoutExplorerOpen, setLayoutExplorerOpen] = useState(false);
  const [layoutExplorerSlide, setLayoutExplorerSlide] = useState<SlideData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const slideRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load project and check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Load project
    if (projectId) {
      const loadedProject = getProject(projectId);
      if (loadedProject) {
        setProject(loadedProject);
        setCarousels(loadedProject.carousels);
      } else {
        toast.error('Project not found');
        setLocation('/dashboard');
      }
    }
    setIsLoading(false);

    return () => window.removeEventListener('resize', checkMobile);
  }, [projectId, setLocation]);

  // Auto-save project when carousels change
  useEffect(() => {
    if (project && !isLoading) {
      const updatedProject = { ...project, carousels };
      saveProject(updatedProject);
      setProject(updatedProject);
    }
  }, [carousels]);

  const selectedCarousel = carousels[selectedCarouselIndex];
  const currentSlide = selectedCarousel?.slides[currentSlideIndex];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      const { carousels: parsedCarousels, errors } = parseCarouselCSV(csvContent);

      if (errors.length > 0) {
        toast.error(`CSV parsing errors: ${errors.join(', ')}`);
        return;
      }

      if (parsedCarousels.length === 0) {
        toast.error('No valid carousels found in CSV');
        return;
      }

      setCarousels(parsedCarousels);
      setSelectedCarouselIndex(0);
      setCurrentSlideIndex(0);
      toast.success(`Loaded ${parsedCarousels.length} carousel(s)`);
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportCSV = () => {
    if (!selectedCarousel) return;

      const csvData = selectedCarousel.slides.map(slide => ({
        carousel_id: selectedCarousel.id,
        slide_number: slide.slide_number,
        layout_type: slide.layout_type,
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        body_text: slide.body_text || '',
        quote: slide.quote || '',
        image_url: slide.image_url || '',
        background_color: slide.background_color || '',
        font_color: slide.font_color || '',
        accent_color: slide.accent_color || '',
      }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCarousel.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  const downloadSlide = async () => {
    if (!exportRef.current || !currentSlide) return;

    setIsExporting(true);
    try {
      // Wait for fonts and images to load
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(exportRef.current, {
        width: exportPreset.width,
        height: exportPreset.height,
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedCarousel.id}_slide_${currentSlide.slide_number}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Slide downloaded successfully');
        } else {
          toast.error('Failed to create image blob');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export slide');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAllSlides = async () => {
    if (!selectedCarousel || !exportRef.current) return;

    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(selectedCarousel.id);

      if (!folder) throw new Error('Failed to create ZIP folder');

      // Wait for fonts to load
      await document.fonts.ready;

      for (let i = 0; i < selectedCarousel.slides.length; i++) {
        setCurrentSlideIndex(i);
        // Wait longer for slide to render and fonts to load
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (exportRef.current) {
          const canvas = await html2canvas(exportRef.current, {
            width: exportPreset.width,
            height: exportPreset.height,
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: true,
            logging: false,
          });

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
              if (b) {
                resolve(b);
              } else {
                reject(new Error('Failed to create blob for slide ' + (i + 1)));
              }
            }, 'image/png');
          });

          folder.file(`${selectedCarousel.id}_slide_${selectedCarousel.slides[i].slide_number}.png`, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCarousel.id}_all_slides.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('All slides exported as ZIP successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export slides');
    } finally {
      setIsExporting(false);
    }
  };

  const prevSlide = () => {
    if (!selectedCarousel) return;
    setCurrentSlideIndex((prev) => 
      prev === 0 ? selectedCarousel.slides.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    if (!selectedCarousel) return;
    setCurrentSlideIndex((prev) => 
      prev === selectedCarousel.slides.length - 1 ? 0 : prev + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const handleAddSlide = () => {
    if (!selectedCarousel) return;

    const newSlide: SlideData = {
      carousel_id: selectedCarousel.id,
      slide_number: Math.max(...selectedCarousel.slides.map(s => s.slide_number)) + 1,
      layout_type: 'bold_callout',
      title: 'New Slide',
      subtitle: '',
      body_text: '',
      image_url: '',
      background_color: '#6366F1',
      font_color: '#FFFFFF',
      accent_color: '#FF6B5A',
    };

    const updatedCarousels = [...carousels];
    updatedCarousels[selectedCarouselIndex] = {
      ...selectedCarousel,
      slides: [...selectedCarousel.slides, newSlide],
    };

    setCarousels(updatedCarousels);
    setCurrentSlideIndex(selectedCarousel.slides.length);
    toast.success('Slide added');
  };

  const handleEditSlide = (slide: SlideData) => {
    setEditingSlide(slide);
    setEditorOpen(true);
  };

  const handleSaveSlide = (updatedSlide: SlideData) => {
    if (!selectedCarousel) return;

    const updatedCarousels = [...carousels];
    const slideIndex = selectedCarousel.slides.findIndex(
      s => s.slide_number === updatedSlide.slide_number
    );

    if (slideIndex !== -1) {
      updatedCarousels[selectedCarouselIndex] = {
        ...selectedCarousel,
        slides: selectedCarousel.slides.map((s, i) => 
          i === slideIndex ? updatedSlide : s
        ),
      };

      setCarousels(updatedCarousels);
      toast.success('Slide updated');
    }

    setEditorOpen(false);
    setEditingSlide(undefined);
  };

  const handleDeleteSlide = (slideNumber: number) => {
    if (!selectedCarousel || selectedCarousel.slides.length === 1) {
      toast.error('Cannot delete the last slide');
      return;
    }

    const updatedCarousels = [...carousels];
    updatedCarousels[selectedCarouselIndex] = {
      ...selectedCarousel,
      slides: selectedCarousel.slides.filter(s => s.slide_number !== slideNumber),
    };

    setCarousels(updatedCarousels);
    
    if (currentSlideIndex >= updatedCarousels[selectedCarouselIndex].slides.length) {
      setCurrentSlideIndex(updatedCarousels[selectedCarouselIndex].slides.length - 1);
    }

    toast.success('Slide deleted');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedCarousel) return;

    const slides = Array.from(selectedCarousel.slides);
    const [reorderedSlide] = slides.splice(result.source.index, 1);
    slides.splice(result.destination.index, 0, reorderedSlide);

    const updatedCarousels = [...carousels];
    updatedCarousels[selectedCarouselIndex] = {
      ...selectedCarousel,
      slides,
    };

    setCarousels(updatedCarousels);
    setCurrentSlideIndex(result.destination.index);
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = CAROUSEL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const carouselId = template.name.toLowerCase().replace(/\s+/g, '_');
    const newCarousel: CarouselData = {
      id: carouselId,
      slides: template.slides.map(slide => ({
        ...slide,
        carousel_id: carouselId,
      })),
    };

    setCarousels([...carousels, newCarousel]);
    setSelectedCarouselIndex(carousels.length);
    setCurrentSlideIndex(0);
    setTemplatesOpen(false);
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleOpenLayoutExplorer = (slide: SlideData) => {
    setLayoutExplorerSlide(slide);
    setLayoutExplorerOpen(true);
  };

  const handleApplyLayout = (layoutType: LayoutType | string) => {
    if (!selectedCarousel || !layoutExplorerSlide) return;

    const updatedCarousels = [...carousels];
    const slideIndex = selectedCarousel.slides.findIndex(
      s => s.slide_number === layoutExplorerSlide.slide_number
    );

    if (slideIndex !== -1) {
      updatedCarousels[selectedCarouselIndex] = {
        ...selectedCarousel,
        slides: selectedCarousel.slides.map((s, i) =>
          i === slideIndex ? { ...s, layout_type: layoutType as LayoutType } : s
        ),
      };

      setCarousels(updatedCarousels);
      toast.success(`Layout changed to ${layoutType}`);
    }

    setLayoutExplorerOpen(false);
    setLayoutExplorerSlide(undefined);
  };

  const handleApplyLayoutToAll = (layoutType: LayoutType | string) => {
    if (!selectedCarousel) return;

    const updatedCarousels = [...carousels];
    updatedCarousels[selectedCarouselIndex] = {
      ...selectedCarousel,
      slides: selectedCarousel.slides.map(s => ({
        ...s,
        layout_type: layoutType as LayoutType,
      })),
    };

    setCarousels(updatedCarousels);
    toast.success(`Layout "${layoutType}" applied to all ${selectedCarousel.slides.length} slides`);
    setLayoutExplorerOpen(false);
    setLayoutExplorerSlide(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="dof-huge-title mb-4">LOADING...</div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-8">
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-black shadow-2xl p-8 text-center">
          <Monitor className="h-16 w-16 mx-auto mb-6 text-black" />
          <h1 className="dof-title mb-4">Desktop Only</h1>
          <p className="dof-body mb-4">
            The Instagram Carousel Generator requires a desktop screen for the best experience.
          </p>
          <button
            onClick={() => setLocation('/dashboard')}
            className="dof-btn dof-btn-black"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!selectedCarousel) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="bg-white border-b-4 border-black">
          <div className="px-8 py-10">
            <button
              onClick={() => setLocation('/dashboard')}
              className="dof-btn dof-btn-outline mb-4"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <div className="text-center mb-16">
              <h1 className="dof-huge-title mb-6">
                {project?.name || 'CAROUSEL EDITOR'}
              </h1>
              <p className="dof-body">
                Start by uploading a CSV file or choosing a template
              </p>
            </div>

            <div className="flex gap-8 justify-center mb-20">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="dof-btn dof-btn-green dof-btn-lg"
              >
                <Upload size={24} />
                UPLOAD CSV
              </button>

              <button 
                onClick={() => setTemplatesOpen(true)}
                className="dof-btn dof-btn-outline dof-btn-lg"
              >
                <Sparkles size={24} />
                BROWSE TEMPLATES
              </button>
            </div>

            <div className="bg-gray-50 rounded-3xl border-3 border-black p-10">
              <h2 className="dof-title mb-8">QUICK START</h2>
              <div className="space-y-5 dof-body">
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <p>Upload a CSV file or choose a pre-designed template</p>
                </div>
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <p>Edit slides visually with the built-in editor</p>
                </div>
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <p>Choose your export format (Instagram, LinkedIn, Twitter, etc.)</p>
                </div>
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <p>Download individual slides or entire carousels as PNG files</p>
                </div>
              </div>

              <div className="mt-10">
                <a
                  href="/examples/solenopsism.csv"
                  download
                  className="dof-btn dof-btn-outline"
                >
                  <Download size={18} />
                  DOWNLOAD EXAMPLE CSV
                </a>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="dof-title">CHOOSE A TEMPLATE</DialogTitle>
              <DialogDescription className="dof-body">
                Start with a pre-designed carousel template
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {CAROUSEL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  className="bg-white border-3 border-black rounded-3xl p-8 text-left hover:bg-gray-50 transition-colors group"
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  <h3 className="text-2xl font-black mb-3 group-hover:underline">{template.name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{template.slides.length} SLIDES INCLUDED</p>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const nextSlideNumber = selectedCarousel ? Math.max(...selectedCarousel.slides.map(s => s.slide_number)) + 1 : 1;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Bar - Fixed Height */}
      <div className="bg-white border-b-4 border-black flex-shrink-0">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between gap-8">
            {/* Left: Back Arrow */}
            <button
              onClick={() => setLocation('/dashboard')}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center border-3 border-black rounded-xl hover:bg-gray-100 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Middle: Carousel Selector + Export Preset Dropdowns */}
            <div className="flex-1 flex justify-center items-center gap-4">
              {/* Carousel Selector - Only show if multiple carousels */}
              {carousels.length > 1 && (
                <Select
                  value={selectedCarouselIndex.toString()}
                  onValueChange={(value) => {
                    setSelectedCarouselIndex(parseInt(value, 10));
                    setCurrentSlideIndex(0); // Reset to first slide when switching carousels
                  }}
                >
                  <SelectTrigger className="w-[240px] border-3 border-black rounded-xl h-11 font-bold bg-blue-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-3 border-black rounded-xl">
                    {carousels.map((carousel, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {carousel.id} ({carousel.slides.length} slides)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Export Preset Selector */}
              <Select
                value={exportPreset.id}
                onValueChange={(value) => {
                  const preset = EXPORT_PRESETS.find(p => p.id === value);
                  if (preset) setExportPreset(preset);
                }}
              >
                <SelectTrigger className="w-[220px] border-3 border-black rounded-xl h-11 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-3 border-black rounded-xl">
                  {EXPORT_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right: Icon Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button 
                onClick={handleExportCSV} 
                className="w-11 h-11 flex items-center justify-center border-3 border-black rounded-xl hover:bg-gray-100 transition-colors"
                title="Export CSV"
              >
                <FileDown size={20} />
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-11 h-11 flex items-center justify-center border-3 border-black bg-[#A3E635] rounded-xl hover:bg-[#8BC920] transition-colors"
                title="Upload CSV"
              >
                <Upload size={20} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Sidebar + Canvas - Flex-1 */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Slide List Sidebar - Fixed Width */}
        <div className="w-96 bg-gray-50 border-r-4 border-black flex flex-col flex-shrink-0">
          <div className="p-6 border-b-3 border-black bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="dof-subtitle">SLIDES</h2>
              <button onClick={handleAddSlide} className="dof-btn dof-btn-coral px-4 py-2">
                <Plus size={18} />
                ADD
              </button>
            </div>
            <p className="text-sm text-gray-600 font-bold">
              {selectedCarousel?.slides.length} slide{selectedCarousel?.slides.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {selectedCarousel?.slides.map((slide, index) => (
                      <Draggable
                        key={slide.slide_number}
                        draggableId={`slide-${slide.slide_number}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group relative bg-white border-3 rounded-2xl p-4 transition-all duration-200 ${
                              index === currentSlideIndex
                                ? 'border-coral shadow-lg'
                                : 'border-black hover:shadow-md'
                            } ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
                            style={{
                              borderColor: index === currentSlideIndex ? '#FF6B5A' : '#000',
                              ...provided.draggableProps.style
                            }}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>

                              <div
                                className="flex-1 cursor-pointer min-w-0"
                                onClick={() => goToSlide(index)}
                              >
                                <div className="flex items-center justify-between mb-2 gap-2">
                                  <p className="text-sm font-bold uppercase">
                                    SLIDE {slide.slide_number}
                                  </p>
                                  <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full font-bold uppercase flex-shrink-0">
                                    {slide.layout_type.replace('_', ' ')}
                                  </span>
                                </div>
                                {slide.title && (
                                  <p className="text-sm truncate text-gray-600">{slide.title}</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2.5 pt-3 border-t-2 border-gray-200">
                              <button
                                className="w-full px-4 py-2.5 border-2 border-purple-600 text-purple-600 rounded-full text-xs font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenLayoutExplorer(slide);
                                }}
                              >
                                <Palette className="h-4 w-4" />
                                TEST LAYOUTS
                              </button>
                              <div className="flex gap-2.5">
                                <button
                                  className="flex-1 px-4 py-2 border-2 border-black rounded-full text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSlide(slide);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  EDIT
                                </button>
                                <button
                                  className="flex-1 px-4 py-2 border-2 border-red-600 text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSlide(slide.slide_number);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  DELETE
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Canvas Area - Flex-1 */}
        <div className="flex-1 relative">
          <PanZoomCanvas
            contentWidth={exportPreset.width}
            contentHeight={exportPreset.height}
          >
            <div
              ref={slideRef}
              className="relative bg-white shadow-2xl"
              style={{
                width: `${exportPreset.width}px`,
                height: `${exportPreset.height}px`,
              }}
            >
              {currentSlide && <LayoutRenderer slide={currentSlide} />}
            </div>
          </PanZoomCanvas>
        </div>
      </div>

      {/* Bottom Bar - Fixed Height */}
      <div className="bg-white border-t-4 border-black flex-shrink-0">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left: Navigation Controls */}
            <div className="flex items-center gap-8">
              <button
                onClick={prevSlide}
                disabled={isExporting || !selectedCarousel || selectedCarousel.slides.length <= 1}
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold uppercase text-gray-600">
                  Slide {currentSlideIndex + 1} of {selectedCarousel?.slides.length}
                </span>
                <div className="flex gap-2.5 ml-5">
                  {selectedCarousel?.slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === currentSlideIndex
                          ? 'w-10 bg-black'
                          : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={nextSlide}
                disabled={isExporting || !selectedCarousel || selectedCarousel.slides.length <= 1}
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </div>

            {/* Center: Export Info */}
            <div className="text-center">
              <p className="text-sm text-gray-600 font-bold">
                {exportPreset.name} • {exportPreset.width}×{exportPreset.height}px
              </p>
            </div>

            {/* Right: Download Buttons */}
            <div className="flex gap-4">
              <button
                onClick={downloadSlide}
                disabled={isExporting}
                className="dof-btn dof-btn-coral px-5 py-3 text-sm"
              >
                <Download size={18} />
                DOWNLOAD SLIDE
              </button>
              <button
                onClick={downloadAllSlides}
                disabled={isExporting}
                className="dof-btn dof-btn-black px-5 py-3 text-sm"
              >
                <Download size={18} />
                ALL ({selectedCarousel?.slides.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Editor Dialog */}
      <SlideEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        slide={editingSlide}
        onSave={handleSaveSlide}
        carouselId={selectedCarousel.id}
        nextSlideNumber={nextSlideNumber}
      />

      {/* Layout Explorer Dialog */}
      {layoutExplorerSlide && (
        <LayoutExplorer
          open={layoutExplorerOpen}
          onClose={() => {
            setLayoutExplorerOpen(false);
            setLayoutExplorerSlide(undefined);
          }}
          slide={layoutExplorerSlide}
          onApplyLayout={handleApplyLayout}
          onApplyToAll={handleApplyLayoutToAll}
        />
      )}

      {/* Hidden Export Container - Used for html2canvas capture */}
      <div
        ref={exportRef}
        className="fixed top-[-9999px] left-[-9999px] pointer-events-none"
        style={{
          width: `${exportPreset.width}px`,
          height: `${exportPreset.height}px`,
        }}
      >
        <div
          className="relative bg-white"
          style={{
            width: `${exportPreset.width}px`,
            height: `${exportPreset.height}px`,
          }}
        >
          {currentSlide && <LayoutRenderer slide={currentSlide} />}
        </div>
      </div>

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dof-title">CHOOSE A TEMPLATE</DialogTitle>
            <DialogDescription className="dof-body">
              Start with a pre-designed carousel template
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {CAROUSEL_TEMPLATES.map((template) => (
              <button
                key={template.id}
                className="bg-white border-3 border-black rounded-3xl p-8 text-left hover:bg-gray-50 transition-colors group"
                onClick={() => handleLoadTemplate(template.id)}
              >
                <h3 className="text-2xl font-black mb-3 group-hover:underline">{template.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{template.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{template.slides.length} SLIDES INCLUDED</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
