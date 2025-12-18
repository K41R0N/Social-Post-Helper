/**
 * Component-Based Layout System
 *
 * This system allows layouts to be defined as JSON schemas with reusable components,
 * enabling both visual builders and programmatic generation at scale.
 */

// ============================================================================
// Component Types
// ============================================================================

export type ComponentType =
  | 'container'
  | 'text'
  | 'heading'
  | 'image'
  | 'shape'
  | 'spacer'
  | 'divider'
  | 'icon';

export type AlignmentType = 'left' | 'center' | 'right' | 'justify';
export type VerticalAlignType = 'top' | 'middle' | 'bottom';
export type FlexDirection = 'row' | 'column';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

// ============================================================================
// Style System
// ============================================================================

export interface Spacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface Border {
  width?: number;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  radius?: number;
}

export interface Shadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread?: number;
  color: string;
}

export interface ComponentStyle {
  // Layout
  width?: string | number;  // px or %
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;

  // Spacing
  margin?: Spacing;
  padding?: Spacing;

  // Positioning
  position?: 'relative' | 'absolute';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  zIndex?: number;

  // Flexbox (for containers)
  display?: 'flex' | 'block' | 'inline' | 'inline-flex';
  flexDirection?: FlexDirection;
  alignItems?: FlexAlign;
  justifyContent?: FlexJustify;
  flexWrap?: 'wrap' | 'nowrap';
  gap?: number;

  // Visual
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  opacity?: number;

  // Borders & Shadows
  border?: Border;
  borderRadius?: number;
  boxShadow?: Shadow;

  // Transform
  rotation?: number;
  scale?: number;
}

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  textAlign?: AlignmentType;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontStyle?: 'normal' | 'italic';
}

// ============================================================================
// Component Definitions
// ============================================================================

export interface BaseComponent {
  id: string;
  type: ComponentType;
  style?: ComponentStyle;
  visible?: boolean;
  conditional?: {
    field: string;  // e.g., 'title', 'body_text'
    operator: 'exists' | 'equals' | 'contains';
    value?: string;
  };
}

export interface ContainerComponent extends BaseComponent {
  type: 'container';
  children: LayoutComponent[];
}

export interface TextComponent extends BaseComponent {
  type: 'text';
  content: string | {
    field: string;  // Field name from SlideData (title, body_text, etc.)
    fallback?: string;
  };
  textStyle?: TextStyle;
  maxLines?: number;
  ellipsis?: boolean;
}

export interface HeadingComponent extends BaseComponent {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string | {
    field: string;
    fallback?: string;
  };
  textStyle?: TextStyle;
}

export interface ImageComponent extends BaseComponent {
  type: 'image';
  src: string | {
    field: string;  // e.g., 'image_url'
    fallback?: string;
  };
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

export interface ShapeComponent extends BaseComponent {
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'triangle' | 'line';
  fill?: string;
  stroke?: {
    color: string;
    width: number;
  };
}

export interface SpacerComponent extends BaseComponent {
  type: 'spacer';
  size: number;  // in pixels
}

export interface DividerComponent extends BaseComponent {
  type: 'divider';
  orientation: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface IconComponent extends BaseComponent {
  type: 'icon';
  name: string;  // lucide-react icon name
  size?: number;
  color?: string;
}

export type LayoutComponent =
  | ContainerComponent
  | TextComponent
  | HeadingComponent
  | ImageComponent
  | ShapeComponent
  | SpacerComponent
  | DividerComponent
  | IconComponent;

// ============================================================================
// Layout Schema
// ============================================================================

export interface LayoutSchema {
  id: string;
  name: string;
  description?: string;
  category?: string;

  // Layout dimensions (for export)
  width: number;
  height: number;

  // Root component (usually a container)
  root: LayoutComponent;

  // Metadata
  tags?: string[];
  author?: string;
  createdAt: number;
  updatedAt: number;

  // Preview
  thumbnail?: string;  // base64 or URL
}

// ============================================================================
// Template System
// ============================================================================

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  schema: LayoutSchema;

  // Sample data for preview
  sampleData?: {
    title?: string;
    body_text?: string;
    subtitle?: string;
    quote?: string;
    image_url?: string;
  };
}

// ============================================================================
// Component Library
// ============================================================================

export interface ComponentPreset {
  id: string;
  name: string;
  description: string;
  category: 'text' | 'media' | 'decoration' | 'layout';
  component: LayoutComponent;
  thumbnail?: string;
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;  // e.g., 'root.children[0].style.width'
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Convert SlideData to component context for rendering
 */
export interface ComponentContext {
  slideData: {
    title?: string;
    body_text?: string;
    subtitle?: string;
    quote?: string;
    image_url?: string;
    background_color?: string;
    font_color?: string;
    accent_color?: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
}

/**
 * Resolve field references in component content
 */
export function resolveField(
  field: string | { field: string; fallback?: string },
  context: ComponentContext
): string {
  if (typeof field === 'string') {
    return field;
  }

  const value = context.slideData[field.field as keyof typeof context.slideData];
  return value || field.fallback || '';
}

/**
 * Apply global color variables to style
 */
export function applyColorVariables(
  style: ComponentStyle | undefined,
  context: ComponentContext
): ComponentStyle | undefined {
  if (!style) return style;

  const processed = { ...style };

  // Replace color variables
  if (processed.backgroundColor === '{{background_color}}') {
    processed.backgroundColor = context.slideData.background_color;
  }
  if (processed.backgroundColor === '{{accent_color}}') {
    processed.backgroundColor = context.slideData.accent_color;
  }

  if (processed.border?.color === '{{font_color}}') {
    processed.border.color = context.slideData.font_color;
  }
  if (processed.border?.color === '{{accent_color}}') {
    processed.border.color = context.slideData.accent_color;
  }

  return processed;
}

/**
 * Generate component ID
 */
export function generateComponentId(type: ComponentType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
