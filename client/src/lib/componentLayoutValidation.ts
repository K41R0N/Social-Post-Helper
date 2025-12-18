/**
 * Component Layout Validation
 *
 * Validates layout schemas to ensure quality and prevent common issues.
 */

import type {
  LayoutSchema,
  LayoutComponent,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types/componentLayout';

// ============================================================================
// Validation Rules
// ============================================================================

const VALIDATION_RULES = {
  // Size limits
  MIN_FONT_SIZE: 12,
  MAX_FONT_SIZE: 200,
  MIN_LAYOUT_SIZE: 100,
  MAX_LAYOUT_SIZE: 5000,

  // Readability
  MIN_LINE_HEIGHT: 1.0,
  MAX_LINE_HEIGHT: 3.0,
  RECOMMENDED_LINE_HEIGHT: 1.5,

  // Accessibility
  MIN_CONTRAST_RATIO: 4.5,  // WCAG AA standard
  MIN_TOUCH_TARGET_SIZE: 44,  // 44px minimum for touch targets

  // Performance
  MAX_NESTING_DEPTH: 10,
  MAX_COMPONENTS: 100,

  // Spacing
  MIN_PADDING: 0,
  MAX_PADDING: 200,
};

// ============================================================================
// Color Contrast Utilities
// ============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// Component Validation
// ============================================================================

function validateComponent(
  component: LayoutComponent,
  path: string,
  depth: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Check nesting depth
  if (depth > VALIDATION_RULES.MAX_NESTING_DEPTH) {
    errors.push({
      path,
      message: `Nesting depth exceeds maximum of ${VALIDATION_RULES.MAX_NESTING_DEPTH}`,
      code: 'MAX_NESTING_EXCEEDED',
    });
  }

  // Validate component-specific rules
  switch (component.type) {
    case 'text':
    case 'heading':
      validateTextComponent(component as any, path, errors, warnings);
      break;
    case 'image':
      validateImageComponent(component as any, path, errors, warnings);
      break;
    case 'container':
      validateContainerComponent(component as any, path, depth, errors, warnings);
      break;
  }

  // Validate style
  if (component.style) {
    validateStyle(component.style, path, errors, warnings);
  }
}

function validateTextComponent(
  component: { type: 'text' | 'heading'; textStyle?: any; content: any },
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const { textStyle, content } = component;

  // Check if content exists
  if (!content || (typeof content === 'string' && content.trim() === '')) {
    warnings.push({
      path: `${path}.content`,
      message: 'Text component has no content',
      suggestion: 'Add content or use a field reference like {field: "title"}',
    });
  }

  if (textStyle) {
    // Font size validation
    if (textStyle.fontSize) {
      if (textStyle.fontSize < VALIDATION_RULES.MIN_FONT_SIZE) {
        errors.push({
          path: `${path}.textStyle.fontSize`,
          message: `Font size ${textStyle.fontSize}px is too small (minimum: ${VALIDATION_RULES.MIN_FONT_SIZE}px)`,
          code: 'FONT_SIZE_TOO_SMALL',
        });
      }
      if (textStyle.fontSize > VALIDATION_RULES.MAX_FONT_SIZE) {
        errors.push({
          path: `${path}.textStyle.fontSize`,
          message: `Font size ${textStyle.fontSize}px is too large (maximum: ${VALIDATION_RULES.MAX_FONT_SIZE}px)`,
          code: 'FONT_SIZE_TOO_LARGE',
        });
      }
    }

    // Line height validation
    if (textStyle.lineHeight) {
      if (textStyle.lineHeight < VALIDATION_RULES.MIN_LINE_HEIGHT) {
        warnings.push({
          path: `${path}.textStyle.lineHeight`,
          message: `Line height ${textStyle.lineHeight} may be too tight`,
          suggestion: `Use at least ${VALIDATION_RULES.MIN_LINE_HEIGHT} for readability`,
        });
      }
      if (textStyle.lineHeight > VALIDATION_RULES.MAX_LINE_HEIGHT) {
        warnings.push({
          path: `${path}.textStyle.lineHeight`,
          message: `Line height ${textStyle.lineHeight} may be too loose`,
          suggestion: `Consider using a value between ${VALIDATION_RULES.MIN_LINE_HEIGHT} and ${VALIDATION_RULES.MAX_LINE_HEIGHT}`,
        });
      }
    } else {
      warnings.push({
        path: `${path}.textStyle.lineHeight`,
        message: 'Line height not specified',
        suggestion: `Add lineHeight: ${VALIDATION_RULES.RECOMMENDED_LINE_HEIGHT} for better readability`,
      });
    }
  }
}

function validateImageComponent(
  component: { type: 'image'; src: any; alt?: string },
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Check if image source exists
  if (!component.src) {
    errors.push({
      path: `${path}.src`,
      message: 'Image component has no source',
      code: 'MISSING_IMAGE_SOURCE',
    });
  }

  // Check for alt text (accessibility)
  if (!component.alt) {
    warnings.push({
      path: `${path}.alt`,
      message: 'Image is missing alt text',
      suggestion: 'Add alt text for accessibility',
    });
  }
}

function validateContainerComponent(
  component: { type: 'container'; children: LayoutComponent[] },
  path: string,
  depth: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate children
  component.children.forEach((child, index) => {
    validateComponent(child, `${path}.children[${index}]`, depth + 1, errors, warnings);
  });

  // Check for empty containers
  if (component.children.length === 0) {
    warnings.push({
      path,
      message: 'Container has no children',
      suggestion: 'Add components to this container or remove it',
    });
  }
}

function validateStyle(
  style: any,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate padding
  if (style.padding) {
    const { top = 0, right = 0, bottom = 0, left = 0 } = style.padding;
    [top, right, bottom, left].forEach((value, index) => {
      const side = ['top', 'right', 'bottom', 'left'][index];
      if (value < VALIDATION_RULES.MIN_PADDING) {
        errors.push({
          path: `${path}.style.padding.${side}`,
          message: `Padding cannot be negative`,
          code: 'INVALID_PADDING',
        });
      }
      if (value > VALIDATION_RULES.MAX_PADDING) {
        warnings.push({
          path: `${path}.style.padding.${side}`,
          message: `Padding ${value}px is very large`,
          suggestion: `Consider using a smaller value (< ${VALIDATION_RULES.MAX_PADDING}px)`,
        });
      }
    });
  }

  // Validate width/height
  if (typeof style.width === 'number' && style.width < 0) {
    errors.push({
      path: `${path}.style.width`,
      message: 'Width cannot be negative',
      code: 'INVALID_WIDTH',
    });
  }
  if (typeof style.height === 'number' && style.height < 0) {
    errors.push({
      path: `${path}.style.height`,
      message: 'Height cannot be negative',
      code: 'INVALID_HEIGHT',
    });
  }
}

// ============================================================================
// Schema Validation
// ============================================================================

function validateLayoutDimensions(
  schema: LayoutSchema,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (schema.width < VALIDATION_RULES.MIN_LAYOUT_SIZE) {
    errors.push({
      path: 'width',
      message: `Layout width ${schema.width}px is too small (minimum: ${VALIDATION_RULES.MIN_LAYOUT_SIZE}px)`,
      code: 'LAYOUT_TOO_SMALL',
    });
  }

  if (schema.width > VALIDATION_RULES.MAX_LAYOUT_SIZE) {
    errors.push({
      path: 'width',
      message: `Layout width ${schema.width}px is too large (maximum: ${VALIDATION_RULES.MAX_LAYOUT_SIZE}px)`,
      code: 'LAYOUT_TOO_LARGE',
    });
  }

  if (schema.height < VALIDATION_RULES.MIN_LAYOUT_SIZE) {
    errors.push({
      path: 'height',
      message: `Layout height ${schema.height}px is too small (minimum: ${VALIDATION_RULES.MIN_LAYOUT_SIZE}px)`,
      code: 'LAYOUT_TOO_SMALL',
    });
  }

  if (schema.height > VALIDATION_RULES.MAX_LAYOUT_SIZE) {
    errors.push({
      path: 'height',
      message: `Layout height ${schema.height}px is too large (maximum: ${VALIDATION_RULES.MAX_LAYOUT_SIZE}px)`,
      code: 'LAYOUT_TOO_LARGE',
    });
  }
}

function countComponents(component: LayoutComponent): number {
  let count = 1;
  if (component.type === 'container') {
    component.children.forEach(child => {
      count += countComponents(child);
    });
  }
  return count;
}

function validateComplexity(
  schema: LayoutSchema,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const totalComponents = countComponents(schema.root);

  if (totalComponents > VALIDATION_RULES.MAX_COMPONENTS) {
    warnings.push({
      path: 'root',
      message: `Layout has ${totalComponents} components (recommended maximum: ${VALIDATION_RULES.MAX_COMPONENTS})`,
      suggestion: 'Consider simplifying the layout for better performance',
    });
  }
}

// ============================================================================
// Main Validation Function
// ============================================================================

export function validateLayout(schema: LayoutSchema): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate required fields
  if (!schema.id) {
    errors.push({
      path: 'id',
      message: 'Layout must have an ID',
      code: 'MISSING_ID',
    });
  }

  if (!schema.name || schema.name.trim() === '') {
    errors.push({
      path: 'name',
      message: 'Layout must have a name',
      code: 'MISSING_NAME',
    });
  }

  if (!schema.root) {
    errors.push({
      path: 'root',
      message: 'Layout must have a root component',
      code: 'MISSING_ROOT',
    });
    return { valid: false, errors, warnings };
  }

  // Validate dimensions
  validateLayoutDimensions(schema, errors, warnings);

  // Validate complexity
  validateComplexity(schema, errors, warnings);

  // Validate components recursively
  validateComponent(schema.root, 'root', 0, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Quick Checks
// ============================================================================

export function isLayoutValid(schema: LayoutSchema): boolean {
  const result = validateLayout(schema);
  return result.valid;
}

export function getValidationSummary(result: ValidationResult): string {
  if (result.valid && result.warnings.length === 0) {
    return 'Layout is valid with no issues';
  }

  const parts: string[] = [];

  if (!result.valid) {
    parts.push(`${result.errors.length} error(s)`);
  }

  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning(s)`);
  }

  return parts.join(', ');
}
