import type { CustomLayout } from '../types/customLayout';

/**
 * Variable placeholder pattern (e.g., {{title}}, {{body_text}})
 */
const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

/**
 * Color reference pattern for layer names (e.g., #background, #accent)
 */
const COLOR_REFERENCE_PATTERN = /^#(\w+)$/;

/**
 * Supported template variables
 */
const TEMPLATE_VARIABLES = [
  'title',
  'body_text',
  'subtitle',
  'quote',
  'background_color',
  'font_color',
  'accent_color',
  'heading_font',
  'body_font',
  'accent_font',
  'image_url',
] as const;

type TemplateVariable = typeof TEMPLATE_VARIABLES[number];

/**
 * Parsed SVG element
 */
interface ParsedElement {
  type: 'text' | 'rect' | 'path' | 'group' | 'other';
  id?: string;
  content?: string;
  fill?: string;
  stroke?: string;
  fontFamily?: string;
  fontSize?: string;
  variable?: TemplateVariable;
  children?: ParsedElement[];
}

/**
 * Extracted template data from Figma SVG
 */
interface ExtractedTemplate {
  width: number;
  height: number;
  elements: ParsedElement[];
  variables: Map<TemplateVariable, string[]>; // variable -> element IDs
  colors: Map<string, string>; // color name -> hex value
  fonts: Set<string>;
}

/**
 * Parse SVG content from string
 */
function parseSvgContent(svgContent: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(svgContent, 'image/svg+xml');
}

/**
 * Get SVG dimensions
 */
function getSvgDimensions(svg: Element): { width: number; height: number } {
  const width = parseFloat(svg.getAttribute('width') || '1080');
  const height = parseFloat(svg.getAttribute('height') || '1080');

  // Try viewBox if width/height not set
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox && (!width || !height)) {
    const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(parseFloat);
    return { width: vbWidth || 1080, height: vbHeight || 1080 };
  }

  return { width, height };
}

/**
 * Extract variable from text content
 */
function extractVariable(text: string): TemplateVariable | null {
  const match = text.match(VARIABLE_PATTERN);
  if (match && match.length === 1) {
    const varName = match[0].slice(2, -2); // Remove {{ and }}
    if (TEMPLATE_VARIABLES.includes(varName as TemplateVariable)) {
      return varName as TemplateVariable;
    }
  }
  return null;
}

/**
 * Extract color reference from ID or class
 */
function extractColorReference(id: string): string | null {
  const match = id.match(COLOR_REFERENCE_PATTERN);
  return match ? match[1] : null;
}

/**
 * Parse a single SVG element
 */
function parseElement(element: Element): ParsedElement | null {
  const tagName = element.tagName.toLowerCase();
  const id = element.getAttribute('id') || undefined;

  if (tagName === 'text' || tagName === 'tspan') {
    const textContent = element.textContent || '';
    const variable = extractVariable(textContent);

    return {
      type: 'text',
      id,
      content: textContent,
      fill: element.getAttribute('fill') || undefined,
      fontFamily: element.getAttribute('font-family') || undefined,
      fontSize: element.getAttribute('font-size') || undefined,
      variable: variable || undefined,
    };
  }

  if (tagName === 'rect') {
    return {
      type: 'rect',
      id,
      fill: element.getAttribute('fill') || undefined,
      stroke: element.getAttribute('stroke') || undefined,
    };
  }

  if (tagName === 'path') {
    return {
      type: 'path',
      id,
      fill: element.getAttribute('fill') || undefined,
      stroke: element.getAttribute('stroke') || undefined,
    };
  }

  if (tagName === 'g') {
    const children: ParsedElement[] = [];
    for (const child of element.children) {
      const parsed = parseElement(child);
      if (parsed) children.push(parsed);
    }

    return {
      type: 'group',
      id,
      children,
    };
  }

  return null;
}

/**
 * Extract template data from SVG document
 */
function extractTemplateData(doc: Document): ExtractedTemplate {
  const svg = doc.querySelector('svg');
  if (!svg) {
    throw new Error('Invalid SVG: No <svg> element found');
  }

  const dimensions = getSvgDimensions(svg);
  const elements: ParsedElement[] = [];
  const variables = new Map<TemplateVariable, string[]>();
  const colors = new Map<string, string>();
  const fonts = new Set<string>();

  // Parse all elements
  function processElement(el: Element) {
    const parsed = parseElement(el);
    if (parsed) {
      elements.push(parsed);

      // Track variables
      if (parsed.variable && parsed.id) {
        const ids = variables.get(parsed.variable) || [];
        ids.push(parsed.id);
        variables.set(parsed.variable, ids);
      }

      // Track fonts
      if (parsed.fontFamily) {
        fonts.add(parsed.fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
      }

      // Track color references
      if (parsed.id) {
        const colorRef = extractColorReference(parsed.id);
        if (colorRef && parsed.fill) {
          colors.set(colorRef, parsed.fill);
        }
      }

      // Process children
      if (parsed.children) {
        for (const child of parsed.children) {
          if (child.variable && child.id) {
            const ids = variables.get(child.variable) || [];
            ids.push(child.id);
            variables.set(child.variable, ids);
          }
          if (child.fontFamily) {
            fonts.add(child.fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
          }
        }
      }
    }

    // Recurse into children
    for (const child of el.children) {
      processElement(child);
    }
  }

  for (const child of svg.children) {
    processElement(child);
  }

  return {
    ...dimensions,
    elements,
    variables,
    colors,
    fonts,
  };
}

/**
 * Generate HTML template from extracted data
 */
function generateHtmlTemplate(template: ExtractedTemplate, originalSvg: string): string {
  // For simplicity, we'll create a container that embeds the SVG
  // and uses CSS to style the variable placeholders
  let html = `<div class="figma-layout" style="width: 100%; height: 100%; position: relative;">`;

  // Add text placeholders
  for (const [variable, elementIds] of template.variables) {
    if (['title', 'body_text', 'subtitle', 'quote'].includes(variable)) {
      html += `
  <div class="var-${variable}" data-variable="${variable}">
    {{${variable}}}
  </div>`;
    }
  }

  html += `
</div>`;

  return html;
}

/**
 * Generate CSS template from extracted data
 */
function generateCssTemplate(template: ExtractedTemplate): string {
  let css = `.figma-layout {
  background-color: {{background_color}};
  color: {{font_color}};
  font-family: {{body_font}}, sans-serif;
  padding: 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

`;

  // Add styles for each variable type
  if (template.variables.has('title')) {
    css += `.var-title {
  font-family: {{heading_font}}, sans-serif;
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 24px;
}

`;
  }

  if (template.variables.has('subtitle')) {
    css += `.var-subtitle {
  font-family: {{body_font}}, sans-serif;
  font-size: 24px;
  color: {{accent_color}};
  margin-bottom: 16px;
}

`;
  }

  if (template.variables.has('body_text')) {
    css += `.var-body_text {
  font-family: {{body_font}}, sans-serif;
  font-size: 20px;
  line-height: 1.6;
}

`;
  }

  if (template.variables.has('quote')) {
    css += `.var-quote {
  font-family: {{accent_font}}, serif;
  font-size: 28px;
  font-style: italic;
  padding-left: 24px;
  border-left: 4px solid {{accent_color}};
}

`;
  }

  return css;
}

/**
 * Parse a Figma-exported SVG and convert it to a Go-Round custom layout
 */
export async function parseFigmaSvg(
  svgContent: string,
  name: string
): Promise<CustomLayout | null> {
  try {
    const doc = parseSvgContent(svgContent);

    // Check for parser errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error('SVG parsing error:', parserError.textContent);
      return null;
    }

    const template = extractTemplateData(doc);

    // If no variables found, try to auto-detect text elements
    if (template.variables.size === 0) {
      console.warn('No template variables found in SVG. Using auto-detection.');
      // We could implement auto-detection here based on text element positions
    }

    const htmlTemplate = generateHtmlTemplate(template, svgContent);
    const cssTemplate = generateCssTemplate(template);

    const layout: CustomLayout = {
      id: `figma-${Date.now()}`,
      name: name || 'Imported Figma Layout',
      description: `Imported from Figma SVG (${template.width}x${template.height})`,
      htmlTemplate,
      cssTemplate,
      createdAt: new Date().toISOString(),
      isFromFigma: true,
      originalSvg: svgContent,
      detectedFonts: Array.from(template.fonts),
      detectedColors: Object.fromEntries(template.colors),
    };

    return layout;
  } catch (error) {
    console.error('Failed to parse Figma SVG:', error);
    return null;
  }
}

/**
 * Validate that an SVG contains proper Figma export markers
 */
export function isFigmaSvg(svgContent: string): boolean {
  // Check for common Figma export patterns
  return (
    svgContent.includes('xmlns="http://www.w3.org/2000/svg"') &&
    (svgContent.includes('Figma') ||
      svgContent.includes('figma') ||
      svgContent.includes('data-figma') ||
      // Also accept any valid SVG
      svgContent.includes('<svg'))
  );
}

/**
 * Extract color palette from Figma SVG
 */
export function extractColorPalette(svgContent: string): string[] {
  const colorPattern = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
  const matches = svgContent.match(colorPattern) || [];
  return [...new Set(matches)];
}

/**
 * Detect fonts used in Figma SVG
 */
export function detectFonts(svgContent: string): string[] {
  const fontPattern = /font-family[=:]\s*["']?([^"';]+)/g;
  const fonts = new Set<string>();

  let match;
  while ((match = fontPattern.exec(svgContent)) !== null) {
    const fontFamily = match[1].split(',')[0].trim().replace(/['"]/g, '');
    if (fontFamily && !fontFamily.includes('{{')) {
      fonts.add(fontFamily);
    }
  }

  return [...fonts];
}
