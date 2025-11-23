import Papa from 'papaparse';
import type { SlideData, CarouselData, ParsedCSVData } from '../types/carousel';

export function parseCarouselCSV(csvContent: string): ParsedCSVData {
  const errors: string[] = [];
  const carouselsMap = new Map<string, SlideData[]>();

  try {
    const result = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        errors.push(`CSV Parse Error: ${error.message}`);
      });
    }

    result.data.forEach((row, index) => {
      try {
        // Validate required fields
        if (!row.carousel_id) {
          errors.push(`Row ${index + 2}: Missing carousel_id`);
          return;
        }
        if (!row.slide_number) {
          errors.push(`Row ${index + 2}: Missing slide_number`);
          return;
        }
        if (!row.layout_type) {
          errors.push(`Row ${index + 2}: Missing layout_type`);
          return;
        }

        const slideData: SlideData = {
          carousel_id: row.carousel_id.trim(),
          slide_number: parseInt(row.slide_number, 10),
          layout_type: row.layout_type.trim() as SlideData['layout_type'],
          background_color: row.background_color?.trim() || '#FFFFFF',
          title: row.title?.trim() || undefined,
          body_text: row.body_text?.trim() || undefined,
          subtitle: row.subtitle?.trim() || undefined,
          quote: row.quote?.trim() || undefined,
          font_color: row.font_color?.trim() || '#000000',
          accent_color: row.accent_color?.trim() || '#B8312F',
          image_url: row.image_url?.trim() || undefined,
        };

        // Validate slide number
        if (isNaN(slideData.slide_number)) {
          errors.push(`Row ${index + 2}: Invalid slide_number "${row.slide_number}"`);
          return;
        }

        // Group by carousel_id
        if (!carouselsMap.has(slideData.carousel_id)) {
          carouselsMap.set(slideData.carousel_id, []);
        }
        carouselsMap.get(slideData.carousel_id)!.push(slideData);
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Sort slides within each carousel by slide_number
    const carousels: CarouselData[] = Array.from(carouselsMap.entries()).map(([id, slides]) => ({
      id,
      slides: slides.sort((a, b) => a.slide_number - b.slide_number),
    }));

    return { carousels, errors };
  } catch (error) {
    errors.push(`Fatal Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { carousels: [], errors };
  }
}

export function validateSlideData(slide: SlideData): string[] {
  const errors: string[] = [];
  
  // Validate layout-specific required fields
  switch (slide.layout_type) {
    case 'dictionary_entry':
      if (!slide.title) errors.push('dictionary_entry requires title');
      if (!slide.body_text) errors.push('dictionary_entry requires body_text');
      if (!slide.subtitle) errors.push('dictionary_entry requires subtitle (pronunciation)');
      if (!slide.quote) errors.push('dictionary_entry requires quote (etymology)');
      break;
    
    case 'minimalist_focus':
    case 'header_body':
      if (!slide.title) errors.push(`${slide.layout_type} requires title`);
      if (!slide.body_text) errors.push(`${slide.layout_type} requires body_text`);
      break;
    
    case 'bold_callout':
      if (!slide.body_text) errors.push('bold_callout requires body_text');
      break;
    
    case 'quote_highlight':
      if (!slide.quote) errors.push('quote_highlight requires quote');
      if (!slide.subtitle) errors.push('quote_highlight requires subtitle (attribution)');
      break;
    
    case 'list_layout':
      if (!slide.title) errors.push('list_layout requires title');
      if (!slide.body_text) errors.push('list_layout requires body_text');
      break;
    
    case 'stat_showcase':
      if (!slide.title) errors.push('stat_showcase requires title (the statistic)');
      if (!slide.body_text) errors.push('stat_showcase requires body_text (context)');
      break;
    
    case 'split_content':
      if (!slide.title) errors.push('split_content requires title');
      if (!slide.body_text) errors.push('split_content requires body_text');
      break;
    
    case 'image_overlay':
      if (!slide.image_url) errors.push('image_overlay requires image_url');
      if (!slide.title) errors.push('image_overlay requires title');
      break;
    
    case 'two_part_vertical':
      if (!slide.title) errors.push('two_part_vertical requires title');
      if (!slide.body_text) errors.push('two_part_vertical requires body_text');
      break;

    case 'anti_marketing_hook':
      if (!slide.title) errors.push('anti_marketing_hook requires title');
      if (!slide.subtitle) errors.push('anti_marketing_hook requires subtitle');
      if (!slide.body_text) errors.push('anti_marketing_hook requires body_text');
      break;

    case 'anti_marketing_content':
      if (!slide.title) errors.push('anti_marketing_content requires title');
      if (!slide.body_text) errors.push('anti_marketing_content requires body_text');
      break;

    case 'anti_marketing_cta':
      if (!slide.title) errors.push('anti_marketing_cta requires title');
      if (!slide.body_text) errors.push('anti_marketing_cta requires body_text');
      break;
  }
  
  return errors;
}
