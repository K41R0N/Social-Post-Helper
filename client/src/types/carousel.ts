export type LayoutType =
  | 'dictionary_entry'
  | 'minimalist_focus'
  | 'bold_callout'
  | 'split_content'
  | 'quote_highlight'
  | 'list_layout'
  | 'stat_showcase'
  | 'header_body'
  | 'image_overlay'
  | 'two_part_vertical'
  | 'anti_marketing_hook'
  | 'anti_marketing_content'
  | 'anti_marketing_cta';

export interface SlideData {
  carousel_id: string;
  slide_number: number;
  layout_type: LayoutType;
  background_color: string;
  title?: string;
  body_text?: string;
  subtitle?: string;
  quote?: string;
  font_color: string;
  accent_color: string;
  image_url?: string;
}

export interface CarouselData {
  id: string;
  slides: SlideData[];
}

export interface ParsedCSVData {
  carousels: CarouselData[];
  errors: string[];
}
