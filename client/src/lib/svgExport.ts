import type { SlideData } from '../types/carousel';
import type { FontSettings } from '../types/font';
import type { CustomLayout } from '../types/customLayout';
import { getFontSettings, getAllCustomFonts, generateFontFaceCSS } from './fontStorage';
import { getAllCustomLayouts } from './customLayoutStorage';

/**
 * Export preset dimensions
 */
export interface ExportPreset {
  id: string;
  name: string;
  width: number;
  height: number;
}

/**
 * SVG metadata for re-importing
 */
interface SvgMetadata {
  layout: string;
  variables: {
    name: string;
    element: string;
    attr?: string;
  }[];
}

/**
 * Escape text for SVG
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Get contrasting text color
 */
function getContrastColor(bgColor: string): string {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return '#ffffff';

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Generate embedded font CSS for SVG
 */
function generateEmbeddedFontCSS(fontSettings: FontSettings): string {
  const customFonts = getAllCustomFonts();
  const usedFonts = new Set([
    fontSettings.headingFont,
    fontSettings.bodyFont,
    fontSettings.accentFont,
  ]);

  let css = '';

  // Add custom fonts
  for (const font of customFonts) {
    if (usedFonts.has(font.family)) {
      css += generateFontFaceCSS(font) + '\n';
    }
  }

  // Add Google Fonts (as fallback, they may not render in SVG viewers)
  // For proper embedding, we'd need to fetch and base64 encode them
  for (const family of fontSettings.googleFonts) {
    if (usedFonts.has(family)) {
      css += `/* Google Font: ${family} - Load via CSS link */\n`;
    }
  }

  return css;
}

/**
 * Generate SVG metadata for re-import
 */
function generateMetadata(slide: SlideData): string {
  const metadata: SvgMetadata = {
    layout: slide.layout_type,
    variables: [
      { name: 'title', element: 'title-text' },
      { name: 'body_text', element: 'body-text' },
      { name: 'subtitle', element: 'subtitle-text' },
      { name: 'quote', element: 'quote-text' },
      { name: 'background_color', element: 'background', attr: 'fill' },
      { name: 'font_color', element: 'title-text', attr: 'fill' },
      { name: 'accent_color', element: 'accent-element', attr: 'fill' },
    ],
  };

  return `
  <metadata>
    <goround:slide xmlns:goround="https://goround.dev/schema">
      <goround:layout>${escapeXml(metadata.layout)}</goround:layout>
      <goround:carousel_id>${escapeXml(slide.carousel_id)}</goround:carousel_id>
      <goround:slide_number>${slide.slide_number}</goround:slide_number>
      <goround:variables>
        ${metadata.variables
          .map(
            (v) =>
              `<goround:var name="${v.name}" element="${v.element}"${v.attr ? ` attr="${v.attr}"` : ''}/>`
          )
          .join('\n        ')}
      </goround:variables>
    </goround:slide>
  </metadata>`;
}

/**
 * Render dictionary entry layout as SVG
 */
function renderDictionaryEntry(
  slide: SlideData,
  width: number,
  height: number,
  fonts: FontSettings
): string {
  const padding = Math.min(width, height) * 0.06;
  const titleSize = Math.min(width, height) * 0.08;
  const bodySize = Math.min(width, height) * 0.035;
  const subtitleSize = Math.min(width, height) * 0.025;

  return `
    <rect id="background" width="${width}" height="${height}" fill="${slide.background_color}"/>

    <g id="content">
      ${
        slide.title
          ? `
        <text id="title-text"
              x="${padding}" y="${padding + titleSize}"
              font-family="${fonts.headingFont}, sans-serif"
              font-size="${titleSize}"
              font-weight="bold"
              fill="${slide.font_color}">
          ${escapeXml(slide.title)}
        </text>
      `
          : ''
      }

      ${
        slide.subtitle
          ? `
        <text id="subtitle-text"
              x="${padding}" y="${padding + titleSize + subtitleSize + 10}"
              font-family="${fonts.bodyFont}, sans-serif"
              font-size="${subtitleSize}"
              font-style="italic"
              fill="${slide.accent_color}">
          ${escapeXml(slide.subtitle)}
        </text>
      `
          : ''
      }

      <line id="accent-element"
            x1="${padding}" y1="${padding + titleSize + subtitleSize + 30}"
            x2="${width - padding}" y2="${padding + titleSize + subtitleSize + 30}"
            stroke="${slide.accent_color}"
            stroke-width="2"/>

      ${
        slide.body_text
          ? `
        <foreignObject x="${padding}" y="${padding + titleSize + subtitleSize + 50}"
                       width="${width - padding * 2}" height="${height - padding * 2 - titleSize - subtitleSize - 60}">
          <div xmlns="http://www.w3.org/1999/xhtml"
               style="font-family: ${fonts.bodyFont}, sans-serif;
                      font-size: ${bodySize}px;
                      color: ${slide.font_color};
                      line-height: 1.6;">
            ${escapeXml(slide.body_text)}
          </div>
        </foreignObject>
      `
          : ''
      }
    </g>`;
}

/**
 * Render bold callout layout as SVG
 */
function renderBoldCallout(
  slide: SlideData,
  width: number,
  height: number,
  fonts: FontSettings
): string {
  const padding = Math.min(width, height) * 0.1;
  const textSize = Math.min(width, height) * 0.06;

  const lines = (slide.body_text || slide.title || '').split('\n');
  const lineHeight = textSize * 1.4;
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + textSize;

  return `
    <rect id="background" width="${width}" height="${height}" fill="${slide.background_color}"/>

    <g id="content">
      ${lines
        .map(
          (line, i) => `
        <text id="body-text-${i}"
              x="${width / 2}" y="${startY + i * lineHeight}"
              font-family="${fonts.headingFont}, sans-serif"
              font-size="${textSize}"
              font-weight="bold"
              text-anchor="middle"
              fill="${slide.font_color}">
          ${escapeXml(line)}
        </text>
      `
        )
        .join('')}
    </g>`;
}

/**
 * Render header/body layout as SVG
 */
function renderHeaderBody(
  slide: SlideData,
  width: number,
  height: number,
  fonts: FontSettings
): string {
  const padding = Math.min(width, height) * 0.08;
  const titleSize = Math.min(width, height) * 0.1;
  const bodySize = Math.min(width, height) * 0.04;

  return `
    <rect id="background" width="${width}" height="${height}" fill="${slide.background_color}"/>

    <g id="content">
      ${
        slide.title
          ? `
        <text id="title-text"
              x="${width / 2}" y="${height * 0.35}"
              font-family="${fonts.headingFont}, sans-serif"
              font-size="${titleSize}"
              font-weight="bold"
              text-anchor="middle"
              fill="${slide.font_color}">
          ${escapeXml(slide.title)}
        </text>
      `
          : ''
      }

      <rect id="accent-element"
            x="${width / 2 - 50}" y="${height * 0.42}"
            width="100" height="4"
            fill="${slide.accent_color}"/>

      ${
        slide.body_text
          ? `
        <foreignObject x="${padding}" y="${height * 0.48}"
                       width="${width - padding * 2}" height="${height * 0.4}">
          <div xmlns="http://www.w3.org/1999/xhtml"
               style="font-family: ${fonts.bodyFont}, sans-serif;
                      font-size: ${bodySize}px;
                      color: ${slide.font_color};
                      text-align: center;
                      line-height: 1.6;">
            ${escapeXml(slide.body_text)}
          </div>
        </foreignObject>
      `
          : ''
      }
    </g>`;
}

/**
 * Render quote highlight layout as SVG
 */
function renderQuoteHighlight(
  slide: SlideData,
  width: number,
  height: number,
  fonts: FontSettings
): string {
  const padding = Math.min(width, height) * 0.1;
  const quoteSize = Math.min(width, height) * 0.05;
  const quoteMarkSize = Math.min(width, height) * 0.15;

  return `
    <rect id="background" width="${width}" height="${height}" fill="${slide.background_color}"/>

    <g id="content">
      <text x="${padding}" y="${height * 0.25}"
            font-family="Georgia, serif"
            font-size="${quoteMarkSize}"
            fill="${slide.accent_color}"
            opacity="0.3">
        "
      </text>

      ${
        slide.quote || slide.body_text
          ? `
        <foreignObject x="${padding + 20}" y="${height * 0.3}"
                       width="${width - padding * 2 - 40}" height="${height * 0.4}">
          <div xmlns="http://www.w3.org/1999/xhtml"
               style="font-family: ${fonts.accentFont}, serif;
                      font-size: ${quoteSize}px;
                      font-style: italic;
                      color: ${slide.font_color};
                      line-height: 1.5;">
            ${escapeXml(slide.quote || slide.body_text || '')}
          </div>
        </foreignObject>
      `
          : ''
      }

      ${
        slide.title
          ? `
        <text id="attribution"
              x="${width - padding}" y="${height * 0.8}"
              font-family="${fonts.bodyFont}, sans-serif"
              font-size="${quoteSize * 0.6}"
              text-anchor="end"
              fill="${slide.accent_color}">
          — ${escapeXml(slide.title)}
        </text>
      `
          : ''
      }
    </g>`;
}

/**
 * Render minimalist focus layout as SVG
 */
function renderMinimalistFocus(
  slide: SlideData,
  width: number,
  height: number,
  fonts: FontSettings
): string {
  const padding = Math.min(width, height) * 0.1;
  const titleSize = Math.min(width, height) * 0.06;
  const bodySize = Math.min(width, height) * 0.035;

  return `
    <rect id="background" width="${width}" height="${height}" fill="${slide.background_color}"/>

    <g id="content">
      <rect id="accent-element"
            x="${padding}" y="${height * 0.4}"
            width="4" height="${height * 0.2}"
            fill="${slide.accent_color}"/>

      ${
        slide.title
          ? `
        <text id="title-text"
              x="${padding + 20}" y="${height * 0.45}"
              font-family="${fonts.headingFont}, sans-serif"
              font-size="${titleSize}"
              font-weight="bold"
              fill="${slide.font_color}">
          ${escapeXml(slide.title)}
        </text>
      `
          : ''
      }

      ${
        slide.body_text
          ? `
        <foreignObject x="${padding + 20}" y="${height * 0.5}"
                       width="${width - padding * 2 - 20}" height="${height * 0.3}">
          <div xmlns="http://www.w3.org/1999/xhtml"
               style="font-family: ${fonts.bodyFont}, sans-serif;
                      font-size: ${bodySize}px;
                      color: ${slide.font_color};
                      line-height: 1.6;">
            ${escapeXml(slide.body_text)}
          </div>
        </foreignObject>
      `
          : ''
      }
    </g>`;
}

/**
 * Render custom layout as SVG
 */
function renderCustomLayout(
  slide: SlideData,
  width: number,
  height: number,
  fonts: FontSettings,
  layout: CustomLayout
): string {
  // Substitute variables in the HTML template
  let html = layout.htmlTemplate;
  html = html.replace(/\{\{title\}\}/g, escapeXml(slide.title || ''));
  html = html.replace(/\{\{body_text\}\}/g, escapeXml(slide.body_text || ''));
  html = html.replace(/\{\{subtitle\}\}/g, escapeXml(slide.subtitle || ''));
  html = html.replace(/\{\{quote\}\}/g, escapeXml(slide.quote || ''));
  html = html.replace(/\{\{background_color\}\}/g, slide.background_color);
  html = html.replace(/\{\{font_color\}\}/g, slide.font_color);
  html = html.replace(/\{\{accent_color\}\}/g, slide.accent_color);
  html = html.replace(/\{\{heading_font\}\}/g, fonts.headingFont);
  html = html.replace(/\{\{body_font\}\}/g, fonts.bodyFont);
  html = html.replace(/\{\{accent_font\}\}/g, fonts.accentFont);

  // Substitute variables in CSS
  let css = layout.cssTemplate;
  css = css.replace(/\{\{background_color\}\}/g, slide.background_color);
  css = css.replace(/\{\{font_color\}\}/g, slide.font_color);
  css = css.replace(/\{\{accent_color\}\}/g, slide.accent_color);
  css = css.replace(/\{\{heading_font\}\}/g, fonts.headingFont);
  css = css.replace(/\{\{body_font\}\}/g, fonts.bodyFont);
  css = css.replace(/\{\{accent_font\}\}/g, fonts.accentFont);

  return `
    <rect id="background" width="${width}" height="${height}" fill="${slide.background_color}"/>

    <foreignObject x="0" y="0" width="${width}" height="${height}">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <style>${css}</style>
        ${html}
      </div>
    </foreignObject>`;
}

/**
 * Render a slide layout as SVG content
 */
function renderLayoutContent(
  slide: SlideData,
  width: number,
  height: number,
  fonts: FontSettings
): string {
  switch (slide.layout_type) {
    case 'dictionary_entry':
      return renderDictionaryEntry(slide, width, height, fonts);
    case 'bold_callout':
      return renderBoldCallout(slide, width, height, fonts);
    case 'header_body':
      return renderHeaderBody(slide, width, height, fonts);
    case 'quote_highlight':
      return renderQuoteHighlight(slide, width, height, fonts);
    case 'minimalist_focus':
      return renderMinimalistFocus(slide, width, height, fonts);
    default:
      // Check for custom layout
      if (slide.layout_type.startsWith('custom-')) {
        const layoutId = slide.layout_type.replace('custom-', '');
        const customLayouts = getAllCustomLayouts();
        const layout = customLayouts.find((l) => l.id === layoutId);
        if (layout) {
          return renderCustomLayout(slide, width, height, fonts, layout);
        }
      }
      // Fallback to header/body
      return renderHeaderBody(slide, width, height, fonts);
  }
}

/**
 * Generate a complete SVG document from a slide
 */
export function slideToSvg(
  slide: SlideData,
  preset: ExportPreset,
  options?: { includeMetadata?: boolean }
): string {
  const { width, height } = preset;
  const fonts = getFontSettings();
  const fontCSS = generateEmbeddedFontCSS(fonts);
  const layoutContent = renderLayoutContent(slide, width, height, fonts);
  const metadata = options?.includeMetadata !== false ? generateMetadata(slide) : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}"
     viewBox="0 0 ${width} ${height}">

  <defs>
    <style type="text/css">
      <![CDATA[
        ${fontCSS}

        /* Default styles */
        text {
          dominant-baseline: hanging;
        }
      ]]>
    </style>
  </defs>

  ${metadata}

  ${layoutContent}

</svg>`;
}

/**
 * Generate filename for exported slide
 */
export function generateSlideFilename(
  slide: SlideData,
  carouselName: string,
  preset: ExportPreset,
  format: 'svg' | 'png' = 'svg'
): string {
  const paddedNumber = String(slide.slide_number).padStart(3, '0');
  const safeName = carouselName.replace(/[^a-zA-Z0-9-_]/g, '-');
  return `${safeName}-slide-${paddedNumber}.${format}`;
}
