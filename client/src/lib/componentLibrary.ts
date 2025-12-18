/**
 * Component Library - Reusable Layout Components
 *
 * Pre-built components that users can drag and drop into their layouts.
 * These serve as building blocks for creating custom layouts visually.
 */

import type {
  ComponentPreset,
  LayoutTemplate,
  generateComponentId,
} from '../types/componentLayout';

// ============================================================================
// Text Components
// ============================================================================

export const TEXT_PRESETS: ComponentPreset[] = [
  {
    id: 'text-heading-large',
    name: 'Large Heading',
    description: 'Bold, large heading for titles',
    category: 'text',
    component: {
      id: 'heading-preset',
      type: 'heading',
      level: 1,
      content: { field: 'title', fallback: 'Your Title Here' },
      textStyle: {
        fontSize: 72,
        fontWeight: 900,
        lineHeight: 1.1,
        color: '{{font_color}}',
        textAlign: 'center',
      },
      style: {
        padding: { top: 40, bottom: 20 },
      },
    },
  },
  {
    id: 'text-heading-medium',
    name: 'Medium Heading',
    description: 'Standard heading for subtitles',
    category: 'text',
    component: {
      id: 'heading-preset',
      type: 'heading',
      level: 2,
      content: { field: 'subtitle', fallback: 'Subtitle' },
      textStyle: {
        fontSize: 48,
        fontWeight: 700,
        lineHeight: 1.2,
        color: '{{font_color}}',
        textAlign: 'left',
      },
      style: {
        padding: { top: 20, bottom: 10 },
      },
    },
  },
  {
    id: 'text-body-paragraph',
    name: 'Body Paragraph',
    description: 'Standard body text',
    category: 'text',
    component: {
      id: 'text-preset',
      type: 'text',
      content: { field: 'body_text', fallback: 'Your content goes here...' },
      textStyle: {
        fontSize: 24,
        fontWeight: 400,
        lineHeight: 1.6,
        color: '{{font_color}}',
        textAlign: 'left',
      },
      style: {
        padding: { top: 10, bottom: 10 },
      },
    },
  },
  {
    id: 'text-quote',
    name: 'Quote Block',
    description: 'Stylized quote with accent',
    category: 'text',
    component: {
      id: 'text-preset',
      type: 'text',
      content: { field: 'quote', fallback: '"Your quote here"' },
      textStyle: {
        fontSize: 36,
        fontWeight: 500,
        lineHeight: 1.4,
        color: '{{font_color}}',
        textAlign: 'center',
        fontStyle: 'italic',
      },
      style: {
        padding: { top: 30, right: 40, bottom: 30, left: 40 },
        border: {
          width: 3,
          color: '{{accent_color}}',
          style: 'solid',
        },
        borderRadius: 16,
      },
    },
  },
  {
    id: 'text-callout',
    name: 'Callout Box',
    description: 'Highlighted text box',
    category: 'text',
    component: {
      id: 'text-preset',
      type: 'text',
      content: { field: 'body_text', fallback: 'Important message' },
      textStyle: {
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1.3,
        color: '#FFFFFF',
        textAlign: 'center',
        textTransform: 'uppercase',
      },
      style: {
        padding: { top: 24, right: 32, bottom: 24, left: 32 },
        backgroundColor: '{{accent_color}}',
        borderRadius: 12,
      },
    },
  },
];

// ============================================================================
// Media Components
// ============================================================================

export const MEDIA_PRESETS: ComponentPreset[] = [
  {
    id: 'media-background-image',
    name: 'Background Image',
    description: 'Full-width background image',
    category: 'media',
    component: {
      id: 'image-preset',
      type: 'image',
      src: { field: 'image_url', fallback: '' },
      objectFit: 'cover',
      style: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
      },
    },
  },
  {
    id: 'media-featured-image',
    name: 'Featured Image',
    description: 'Centered featured image',
    category: 'media',
    component: {
      id: 'image-preset',
      type: 'image',
      src: { field: 'image_url' },
      objectFit: 'cover',
      style: {
        width: '100%',
        height: 400,
        borderRadius: 16,
      },
    },
  },
  {
    id: 'media-circular-image',
    name: 'Circular Image',
    description: 'Round profile-style image',
    category: 'media',
    component: {
      id: 'image-preset',
      type: 'image',
      src: { field: 'image_url' },
      objectFit: 'cover',
      style: {
        width: 200,
        height: 200,
        borderRadius: 100,
        border: {
          width: 4,
          color: '{{accent_color}}',
          style: 'solid',
        },
      },
    },
  },
];

// ============================================================================
// Decoration Components
// ============================================================================

export const DECORATION_PRESETS: ComponentPreset[] = [
  {
    id: 'decoration-horizontal-divider',
    name: 'Horizontal Line',
    description: 'Dividing line',
    category: 'decoration',
    component: {
      id: 'divider-preset',
      type: 'divider',
      orientation: 'horizontal',
      thickness: 3,
      color: '{{accent_color}}',
      style: {
        margin: { top: 20, bottom: 20 },
      },
    },
  },
  {
    id: 'decoration-accent-bar',
    name: 'Accent Bar',
    description: 'Colored accent bar',
    category: 'decoration',
    component: {
      id: 'shape-preset',
      type: 'shape',
      shape: 'rectangle',
      fill: '{{accent_color}}',
      style: {
        width: '100%',
        height: 8,
        margin: { top: 16, bottom: 16 },
      },
    },
  },
  {
    id: 'decoration-corner-accent',
    name: 'Corner Accent',
    description: 'Decorative corner shape',
    category: 'decoration',
    component: {
      id: 'shape-preset',
      type: 'shape',
      shape: 'circle',
      fill: '{{accent_color}}',
      style: {
        width: 120,
        height: 120,
        position: 'absolute',
        top: -60,
        right: -60,
        opacity: 0.3,
      },
    },
  },
  {
    id: 'decoration-spacer-small',
    name: 'Small Space',
    description: '20px vertical space',
    category: 'decoration',
    component: {
      id: 'spacer-preset',
      type: 'spacer',
      size: 20,
    },
  },
  {
    id: 'decoration-spacer-large',
    name: 'Large Space',
    description: '60px vertical space',
    category: 'decoration',
    component: {
      id: 'spacer-preset',
      type: 'spacer',
      size: 60,
    },
  },
];

// ============================================================================
// Layout Containers
// ============================================================================

export const LAYOUT_PRESETS: ComponentPreset[] = [
  {
    id: 'layout-centered-column',
    name: 'Centered Column',
    description: 'Vertically stacked centered content',
    category: 'layout',
    component: {
      id: 'container-preset',
      type: 'container',
      children: [],
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: { top: 60, right: 60, bottom: 60, left: 60 },
      },
    },
  },
  {
    id: 'layout-two-columns',
    name: 'Two Columns',
    description: 'Side-by-side columns',
    category: 'layout',
    component: {
      id: 'container-preset',
      type: 'container',
      children: [
        {
          id: 'col-1',
          type: 'container',
          children: [],
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '50%',
            padding: { top: 40, right: 20, bottom: 40, left: 40 },
          },
        },
        {
          id: 'col-2',
          type: 'container',
          children: [],
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '50%',
            padding: { top: 40, right: 40, bottom: 40, left: 20 },
          },
        },
      ],
      style: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        gap: 20,
      },
    },
  },
  {
    id: 'layout-header-body-footer',
    name: 'Header-Body-Footer',
    description: 'Three vertical sections',
    category: 'layout',
    component: {
      id: 'container-preset',
      type: 'container',
      children: [
        {
          id: 'header',
          type: 'container',
          children: [],
          style: {
            display: 'flex',
            flexDirection: 'column',
            padding: { top: 40, right: 40, bottom: 20, left: 40 },
          },
        },
        {
          id: 'body',
          type: 'container',
          children: [],
          style: {
            display: 'flex',
            flexDirection: 'column',
            padding: { top: 20, right: 40, bottom: 20, left: 40 },
          },
        },
        {
          id: 'footer',
          type: 'container',
          children: [],
          style: {
            display: 'flex',
            flexDirection: 'column',
            padding: { top: 20, right: 40, bottom: 40, left: 40 },
          },
        },
      ],
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
      },
    },
  },
  {
    id: 'layout-card',
    name: 'Card Container',
    description: 'Bordered content card',
    category: 'layout',
    component: {
      id: 'container-preset',
      type: 'container',
      children: [],
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: { top: 32, right: 32, bottom: 32, left: 32 },
        backgroundColor: '#FFFFFF',
        border: {
          width: 3,
          color: '#000000',
          style: 'solid',
        },
        borderRadius: 16,
        boxShadow: {
          offsetX: 4,
          offsetY: 4,
          blur: 12,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
];

// ============================================================================
// All Presets
// ============================================================================

export const ALL_COMPONENT_PRESETS: ComponentPreset[] = [
  ...TEXT_PRESETS,
  ...MEDIA_PRESETS,
  ...DECORATION_PRESETS,
  ...LAYOUT_PRESETS,
];

// ============================================================================
// Preset Lookup
// ============================================================================

export function getPresetById(id: string): ComponentPreset | undefined {
  return ALL_COMPONENT_PRESETS.find(preset => preset.id === id);
}

export function getPresetsByCategory(category: ComponentPreset['category']): ComponentPreset[] {
  return ALL_COMPONENT_PRESETS.filter(preset => preset.category === category);
}

// ============================================================================
// Quick Start Templates
// ============================================================================

export const QUICK_START_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'template-centered-title-body',
    name: 'Centered Title + Body',
    description: 'Simple centered layout with title and body text',
    category: 'Text',
    schema: {
      id: 'schema-centered-title-body',
      name: 'Centered Title + Body',
      width: 1080,
      height: 1080,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      root: {
        id: 'root',
        type: 'container',
        children: [
          {
            id: 'title',
            type: 'heading',
            level: 1,
            content: { field: 'title', fallback: 'Your Title' },
            textStyle: {
              fontSize: 64,
              fontWeight: 900,
              color: '{{font_color}}',
              textAlign: 'center',
            },
          },
          {
            id: 'spacer',
            type: 'spacer',
            size: 30,
          },
          {
            id: 'body',
            type: 'text',
            content: { field: 'body_text', fallback: 'Your content here' },
            textStyle: {
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1.6,
              color: '{{font_color}}',
              textAlign: 'center',
            },
          },
        ],
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
    },
    sampleData: {
      title: 'Welcome',
      body_text: 'This is a simple centered layout perfect for announcements and callouts.',
    },
  },
  {
    id: 'template-quote-card',
    name: 'Quote Card',
    description: 'Stylized quote with attribution',
    category: 'Quote',
    schema: {
      id: 'schema-quote-card',
      name: 'Quote Card',
      width: 1080,
      height: 1080,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      root: {
        id: 'root',
        type: 'container',
        children: [
          {
            id: 'quote',
            type: 'text',
            content: { field: 'quote', fallback: 'Your quote here' },
            textStyle: {
              fontSize: 42,
              fontWeight: 500,
              lineHeight: 1.5,
              color: '{{font_color}}',
              textAlign: 'center',
              fontStyle: 'italic',
            },
          },
          {
            id: 'spacer',
            type: 'spacer',
            size: 40,
          },
          {
            id: 'divider',
            type: 'divider',
            orientation: 'horizontal',
            thickness: 3,
            color: '{{accent_color}}',
            style: {
              width: 120,
            },
          },
          {
            id: 'spacer2',
            type: 'spacer',
            size: 20,
          },
          {
            id: 'attribution',
            type: 'text',
            content: { field: 'subtitle', fallback: '— Author' },
            textStyle: {
              fontSize: 24,
              fontWeight: 600,
              color: '{{accent_color}}',
              textAlign: 'center',
            },
          },
        ],
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: { top: 100, right: 100, bottom: 100, left: 100 },
          backgroundColor: '{{background_color}}',
        },
      },
    },
    sampleData: {
      quote: 'The best way to predict the future is to create it.',
      subtitle: '— Peter Drucker',
    },
  },
];
