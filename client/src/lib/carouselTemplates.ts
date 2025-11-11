import type { SlideData } from '../types/carousel';

export interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  slides: Omit<SlideData, 'carousel_id'>[];
}

export const CAROUSEL_TEMPLATES: CarouselTemplate[] = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Announce a new product with impact',
    category: 'Business',
    slides: [
      {
        slide_number: 1,
        layout_type: 'bold_callout',
        background_color: '#1a1a1a',
        body_text: 'Introducing [Your Product Name]',
        font_color: '#ffffff',
        accent_color: '#3b82f6',
      },
      {
        slide_number: 2,
        layout_type: 'header_body',
        background_color: '#ffffff',
        title: 'The Problem',
        body_text: '[Describe the problem your product solves]',
        font_color: '#1a1a1a',
        accent_color: '#3b82f6',
      },
      {
        slide_number: 3,
        layout_type: 'header_body',
        background_color: '#f0f9ff',
        title: 'The Solution',
        body_text: '[Explain how your product solves it]',
        font_color: '#1e3a8a',
        accent_color: '#3b82f6',
      },
      {
        slide_number: 4,
        layout_type: 'list_layout',
        background_color: '#ffffff',
        title: 'Key Features',
        body_text: 'Feature One | Feature Two | Feature Three | Feature Four',
        font_color: '#1a1a1a',
        accent_color: '#3b82f6',
      },
      {
        slide_number: 5,
        layout_type: 'bold_callout',
        background_color: '#3b82f6',
        body_text: 'Available Now. [Your CTA]',
        font_color: '#ffffff',
        accent_color: '#ffffff',
      },
    ],
  },
  {
    id: 'educational-series',
    name: 'Educational Series',
    description: 'Teach a concept step by step',
    category: 'Education',
    slides: [
      {
        slide_number: 1,
        layout_type: 'header_body',
        background_color: '#fef3c7',
        title: '[Topic Name]',
        body_text: 'A beginner-friendly guide',
        subtitle: 'Part 1 of 5',
        font_color: '#92400e',
        accent_color: '#f59e0b',
      },
      {
        slide_number: 2,
        layout_type: 'two_part_vertical',
        background_color: '#ffffff',
        title: 'What is [Concept]?',
        body_text: '[Simple definition and explanation]',
        font_color: '#1a1a1a',
        accent_color: '#f59e0b',
      },
      {
        slide_number: 3,
        layout_type: 'header_body',
        background_color: '#fef3c7',
        title: 'Why It Matters',
        body_text: '[Explain the importance and real-world applications]',
        font_color: '#92400e',
        accent_color: '#f59e0b',
      },
      {
        slide_number: 4,
        layout_type: 'list_layout',
        background_color: '#ffffff',
        title: 'How to Get Started',
        body_text: 'Step One | Step Two | Step Three | Step Four',
        font_color: '#1a1a1a',
        accent_color: '#f59e0b',
      },
      {
        slide_number: 5,
        layout_type: 'bold_callout',
        background_color: '#f59e0b',
        body_text: 'Ready to learn more? Follow for Part 2.',
        font_color: '#ffffff',
        accent_color: '#ffffff',
      },
    ],
  },
  {
    id: 'quote-collection',
    name: 'Quote Collection',
    description: 'Share inspiring quotes with beautiful design',
    category: 'Inspiration',
    slides: [
      {
        slide_number: 1,
        layout_type: 'bold_callout',
        background_color: '#1a1a1a',
        body_text: 'Words of Wisdom',
        font_color: '#ffffff',
        accent_color: '#ec4899',
      },
      {
        slide_number: 2,
        layout_type: 'quote_highlight',
        background_color: '#fdf2f8',
        quote: '[Your first inspiring quote]',
        subtitle: '— Author Name',
        font_color: '#831843',
        accent_color: '#ec4899',
      },
      {
        slide_number: 3,
        layout_type: 'quote_highlight',
        background_color: '#ffffff',
        quote: '[Your second inspiring quote]',
        subtitle: '— Author Name',
        font_color: '#1a1a1a',
        accent_color: '#ec4899',
      },
      {
        slide_number: 4,
        layout_type: 'quote_highlight',
        background_color: '#fdf2f8',
        quote: '[Your third inspiring quote]',
        subtitle: '— Author Name',
        font_color: '#831843',
        accent_color: '#ec4899',
      },
      {
        slide_number: 5,
        layout_type: 'bold_callout',
        background_color: '#ec4899',
        body_text: 'Which quote resonated with you most?',
        font_color: '#ffffff',
        accent_color: '#ffffff',
      },
    ],
  },
  {
    id: 'stats-showcase',
    name: 'Stats Showcase',
    description: 'Present impressive statistics and data',
    category: 'Business',
    slides: [
      {
        slide_number: 1,
        layout_type: 'header_body',
        background_color: '#dcfce7',
        title: '[Your Topic]',
        body_text: 'By The Numbers',
        font_color: '#14532d',
        accent_color: '#22c55e',
      },
      {
        slide_number: 2,
        layout_type: 'stat_showcase',
        background_color: '#ffffff',
        title: '85%',
        subtitle: 'Metric Name',
        body_text: '[Context or explanation of this statistic]',
        font_color: '#1a1a1a',
        accent_color: '#22c55e',
      },
      {
        slide_number: 3,
        layout_type: 'stat_showcase',
        background_color: '#dcfce7',
        title: '10x',
        subtitle: 'Growth Rate',
        body_text: '[Context or explanation of this statistic]',
        font_color: '#14532d',
        accent_color: '#22c55e',
      },
      {
        slide_number: 4,
        layout_type: 'stat_showcase',
        background_color: '#ffffff',
        title: '1M+',
        subtitle: 'Users',
        body_text: '[Context or explanation of this statistic]',
        font_color: '#1a1a1a',
        accent_color: '#22c55e',
      },
      {
        slide_number: 5,
        layout_type: 'bold_callout',
        background_color: '#22c55e',
        body_text: 'Want to see similar results? Let\'s talk.',
        font_color: '#ffffff',
        accent_color: '#ffffff',
      },
    ],
  },
  {
    id: 'brand-story',
    name: 'Brand Story',
    description: 'Tell your brand\'s journey and values',
    category: 'Branding',
    slides: [
      {
        slide_number: 1,
        layout_type: 'bold_callout',
        background_color: '#7c3aed',
        body_text: 'Our Story',
        font_color: '#ffffff',
        accent_color: '#ffffff',
      },
      {
        slide_number: 2,
        layout_type: 'two_part_vertical',
        background_color: '#ffffff',
        title: 'Where We Started',
        body_text: '[Brief origin story of your brand]',
        font_color: '#1a1a1a',
        accent_color: '#7c3aed',
      },
      {
        slide_number: 3,
        layout_type: 'header_body',
        background_color: '#f5f3ff',
        title: 'Our Mission',
        body_text: '[Your brand mission statement and core values]',
        font_color: '#5b21b6',
        accent_color: '#7c3aed',
      },
      {
        slide_number: 4,
        layout_type: 'header_body',
        background_color: '#ffffff',
        title: 'What We Believe',
        body_text: '[Your brand philosophy and principles]',
        font_color: '#1a1a1a',
        accent_color: '#7c3aed',
      },
      {
        slide_number: 5,
        layout_type: 'bold_callout',
        background_color: '#7c3aed',
        body_text: 'Join us on this journey.',
        font_color: '#ffffff',
        accent_color: '#ffffff',
      },
    ],
  },
];

export function getTemplateById(id: string): CarouselTemplate | undefined {
  return CAROUSEL_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): CarouselTemplate[] {
  return CAROUSEL_TEMPLATES.filter(template => template.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(CAROUSEL_TEMPLATES.map(t => t.category)));
}
