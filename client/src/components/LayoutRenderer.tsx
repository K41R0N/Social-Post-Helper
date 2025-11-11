import type { SlideData } from '../types/carousel';
import { getAllCustomLayouts } from '../lib/customLayoutStorage';
import type { CustomLayout } from '../types/customLayout';
import { getFontSettings } from '../lib/fontStorage';

interface LayoutRendererProps {
  slide: SlideData;
}

export default function LayoutRenderer({ slide }: LayoutRendererProps) {
  // Get font settings - these will be used throughout all layouts
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  // Check if this is a custom layout
  const customLayouts = getAllCustomLayouts();
  const customLayout = customLayouts.find(l => `custom-${l.id}` === slide.layout_type);
  
  if (customLayout) {
    return <CustomLayoutRenderer slide={slide} layout={customLayout} />;
  }

  // Responsive font sizing based on container
  const isVertical = window.innerHeight > window.innerWidth;
  const baseFontSize = isVertical ? '0.9em' : '1em';
  
  // Helper function to convert <br> tags to actual line breaks
  const parseBodyText = (text: string) => {
    if (!text) return '';
    // Convert all variations of <br> tags to newlines
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n') // Double breaks become double newlines
      .replace(/<br\s*\/?>/gi, '\n'); // Single breaks become single newlines
  };

  switch (slide.layout_type) {
    case 'dictionary_entry':
      return <DictionaryEntry slide={slide} />;
    case 'minimalist_focus':
      return <MinimalistFocus slide={slide} />;
    case 'bold_callout':
      return <BoldCallout slide={slide} />;
    case 'header_body':
      return <HeaderBody slide={slide} />;
    case 'quote_highlight':
      return <QuoteHighlight slide={slide} />;
    case 'list_layout':
      return <ListLayout slide={slide} />;
    case 'stat_showcase':
      return <StatShowcase slide={slide} />;
    case 'split_content':
      return <SplitContent slide={slide} />;
    case 'image_overlay':
      return <ImageOverlay slide={slide} />;
    case 'two_part_vertical':
      return <TwoPartVertical slide={slide} />;
    default:
      return <div className="w-full h-full flex items-center justify-center">
        <p style={{ color: slide.font_color }}>Unsupported layout type: {slide.layout_type}</p>
      </div>;
  }
}

// Dictionary Entry Layout
function DictionaryEntry({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  const parseBodyText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };
  
  return (
    <div
      className="w-full h-full flex items-center justify-center p-24"
      style={{ backgroundColor: slide.background_color }}
    >
      <div className="max-w-4xl text-center">
        <h1
          className="mb-4"
          style={{
            fontFamily: headingFont,
            fontSize: '140px',
            color: slide.font_color,
            fontWeight: 500,
            lineHeight: '1',
            letterSpacing: '0.02em',
          }}
        >
          {slide.title}
        </h1>

        <p
          className="text-3xl mb-16"
          style={{
            fontFamily: bodyFont,
            color: slide.font_color,
            fontStyle: 'italic',
            fontWeight: 300,
            paddingTop: '10px',
          }}
        >
          {slide.subtitle}
        </p>

        <div
          className="w-32 h-1 mx-auto mb-16"
          style={{ backgroundColor: slide.accent_color }}
        />

        <p
          className="text-sm font-semibold mb-6"
          style={{
            fontFamily: accentFont,
            color: slide.accent_color,
            letterSpacing: '0.15em',
            fontWeight: 500,
          }}
        >
          ETYMOLOGY
        </p>

        <p
          className="text-2xl mb-12"
          style={{
            fontFamily: bodyFont,
            color: slide.font_color,
            fontStyle: 'italic',
            fontWeight: 400,
          }}
        >
          {slide.quote}
        </p>

        <p
          className="text-[26px] leading-relaxed"
          style={{
            fontFamily: bodyFont,
            color: slide.font_color,
            fontWeight: 400,
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
          }}
        >
          {parseBodyText(slide.body_text || '')}
        </p>
      </div>
    </div>
  );
}

// Minimalist Focus Layout
function MinimalistFocus({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  // Parse body text to convert <br> tags to newlines
  const parseBodyText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };
  
  return (
    <div
      className="w-full h-full flex items-center justify-center p-24"
      style={{ backgroundColor: slide.background_color }}
    >
      <div className="max-w-4xl">
        <h2
          className="mb-12"
          style={{
            fontFamily: accentFont,
            fontSize: '80px',
            color: slide.font_color,
            fontWeight: 500,
            lineHeight: '1.1',
          }}
        >
          {slide.title}
        </h2>

        <div
          className="w-24 h-0.5 mb-16"
          style={{ backgroundColor: slide.accent_color }}
        />

        <p
          style={{
            fontFamily: bodyFont,
            fontSize: '36px',
            color: slide.font_color,
            fontWeight: 400,
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
          }}
        >
          {parseBodyText(slide.body_text || '')}
        </p>
      </div>
    </div>
  );
}

// Bold Callout Layout
function BoldCallout({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  const parseBodyText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };
  
  return (
    <div
      className="w-full h-full flex items-center justify-center p-24"
      style={{ backgroundColor: slide.background_color }}
    >
      <div className="max-w-4xl text-center">
        <p
          className="text-[48px] leading-tight"
          style={{
            fontFamily: bodyFont,
            color: slide.font_color,
            fontWeight: 400,
            lineHeight: '1.4',
            whiteSpace: 'pre-wrap',
          }}
        >
          {parseBodyText(slide.body_text || '')}
        </p>
      </div>
    </div>
  );
}

// Header Body Layout
function HeaderBody({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  const parseBodyText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };
  
  return (
    <div
      className="w-full h-full flex items-center justify-center p-24"
      style={{ backgroundColor: slide.background_color }}
    >
      <div className="max-w-4xl">
        <h2
          className="mb-16"
          style={{
            fontFamily: accentFont,
            fontSize: '70px',
            color: slide.font_color,
            fontWeight: 500,
            lineHeight: '1.1',
          }}
        >
          {slide.title}
        </h2>

        <p
          style={{
            fontFamily: bodyFont,
            fontSize: '32px',
            color: slide.font_color,
            fontWeight: 400,
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
          }}
        >
          {parseBodyText(slide.body_text || '')}
        </p>
      </div>
    </div>
  );
}

// Quote Highlight Layout
function QuoteHighlight({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  return (
    <div
      className="w-full h-full flex items-center justify-center p-24"
      style={{ backgroundColor: slide.background_color }}
    >
      <div className="max-w-4xl text-center">
        <div
          className="text-[120px] mb-8"
          style={{ color: slide.accent_color, lineHeight: '1', fontFamily: 'Georgia, serif' }}
        >
          "
        </div>
        
        <p
          className="text-[44px] mb-12"
          style={{
            fontFamily: bodyFont,
            color: slide.font_color,
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: '1.4',
          }}
        >
          {slide.quote}
        </p>

        <div
          className="w-24 h-0.5 mx-auto mb-8"
          style={{ backgroundColor: slide.accent_color }}
        />

        <p
          className="text-2xl"
          style={{
            fontFamily: bodyFont,
            color: slide.font_color,
            fontWeight: 400,
          }}
        >
          {slide.subtitle}
        </p>
      </div>
    </div>
  );
}

// List Layout
function ListLayout({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  // Parse body text to handle both | separators and line breaks
  const parseListItems = (text: string): string[] => {
    if (!text) return [];
    
    // First convert <br> tags to newlines
    const normalized = text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n');
    
    // Check if text contains pipe separators
    if (normalized.includes('|')) {
      return normalized.split('|').map(item => item.trim()).filter(item => item.length > 0);
    }
    
    // Otherwise split by newlines
    return normalized.split('\n').map(item => item.trim()).filter(item => item.length > 0);
  };
  
  const items = parseListItems(slide.body_text || '');
  
  return (
    <div
      className="w-full h-full flex items-center justify-center p-24"
      style={{ backgroundColor: slide.background_color }}
    >
      <div className="max-w-4xl w-full">
        <h2
          className="mb-16"
          style={{
            fontFamily: accentFont,
            fontSize: '70px',
            color: slide.font_color,
            fontWeight: 500,
            lineHeight: '1.1',
          }}
        >
          {slide.title}
        </h2>

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-6">
              <span
                className="text-4xl font-bold flex-shrink-0"
                style={{ color: slide.accent_color, fontFamily: accentFont }}
              >
                {index + 1}.
              </span>
              <p
                className="text-3xl"
                style={{
                  fontFamily: bodyFont,
                  color: slide.font_color,
                  fontWeight: 400,
                  lineHeight: '1.5',
                }}
              >
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stat Showcase Layout
function StatShowcase({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  const parseBodyText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };
  
  return (
    <div
      className="w-full h-full flex items-center justify-center p-24"
      style={{ backgroundColor: slide.background_color }}
    >
      <div className="max-w-4xl text-center">
        {slide.subtitle && (
          <p
            className="text-3xl mb-8"
            style={{
              fontFamily: accentFont,
              color: slide.accent_color,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {slide.subtitle}
          </p>
        )}

        <h1
          className="mb-12"
          style={{
            fontFamily: headingFont,
            fontSize: '160px',
            color: slide.font_color,
            fontWeight: 500,
            lineHeight: '1',
          }}
        >
          {slide.title}
        </h1>

        <p
          className="text-4xl"
          style={{
            fontFamily: bodyFont,
            color: slide.font_color,
            fontWeight: 400,
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
          }}
        >
          {parseBodyText(slide.body_text || '')}
        </p>
      </div>
    </div>
  );
}

// Split Content Layout
function SplitContent({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  const parseBodyText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };
  
  return (
    <div
      className="w-full h-full flex"
      style={{ backgroundColor: slide.background_color }}
    >
      <div className="w-1/2 flex items-center justify-center p-16" style={{ backgroundColor: slide.accent_color + '20' }}>
        <h2
          style={{
            fontFamily: accentFont,
            fontSize: '80px',
            color: slide.font_color,
            fontWeight: 500,
            lineHeight: '1.1',
            textAlign: 'center',
          }}
        >
          {slide.title}
        </h2>
      </div>
      
      <div className="w-1/2 flex items-center justify-center p-16">
        <p
          style={{
            fontFamily: bodyFont,
            fontSize: '32px',
            color: slide.font_color,
            fontWeight: 400,
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
          }}
        >
          {parseBodyText(slide.body_text || '')}
        </p>
      </div>
    </div>
  );
}

// Image Overlay Layout
function ImageOverlay({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  const parseBodyText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };
  
  return (
    <div
      className="w-full h-full relative flex items-center justify-center p-24"
      style={{
        backgroundImage: slide.image_url ? `url(${slide.image_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: slide.background_color, opacity: 0.75 }}
      />
      
      <div className="relative z-10 max-w-4xl text-center">
        <h1
          className="mb-8"
          style={{
            fontFamily: headingFont,
            fontSize: '100px',
            color: slide.font_color,
            fontWeight: 500,
            lineHeight: '1.1',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          {slide.title}
        </h1>

        {slide.body_text && (
          <p
            className="text-4xl"
            style={{
              fontFamily: bodyFont,
              color: slide.font_color,
              fontWeight: 400,
              lineHeight: '1.5',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {parseBodyText(slide.body_text)}
          </p>
        )}
      </div>
    </div>
  );
}

// Two Part Vertical Layout
function TwoPartVertical({ slide }: { slide: SlideData }) {
  const fontSettings = getFontSettings();
  const headingFont = fontSettings.headingFont;
  const bodyFont = fontSettings.bodyFont;
  const accentFont = fontSettings.accentFont;
  
  const parseBodyText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
  };
  
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: slide.background_color }}>
      <div className="h-1/2 flex flex-col items-center justify-center p-16">
        <h2
          className="mb-4"
          style={{
            fontFamily: accentFont,
            fontSize: '70px',
            color: slide.font_color,
            fontWeight: 500,
            lineHeight: '1.1',
            textAlign: 'center',
          }}
        >
          {slide.title}
        </h2>
        
        {slide.subtitle && (
          <p
            className="text-2xl"
            style={{
              fontFamily: bodyFont,
              color: slide.font_color,
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
      
      <div
        className="h-0.5 w-3/4 mx-auto"
        style={{ backgroundColor: slide.accent_color }}
      />
      
      <div className="h-1/2 flex items-center justify-center p-16">
        <p
          className="text-3xl max-w-3xl"
          style={{
            fontFamily: bodyFont,
            color: slide.font_color,
            fontWeight: 400,
            lineHeight: '1.6',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
          }}
        >
          {parseBodyText(slide.body_text || '')}
        </p>
      </div>
    </div>
  );
}


// Custom Layout Renderer
function CustomLayoutRenderer({ slide, layout }: { slide: SlideData; layout: CustomLayout }) {
  const templateData = {
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    body_text: slide.body_text || '',
    quote: slide.quote || '',
    background_color: slide.background_color,
    font_color: slide.font_color,
    accent_color: slide.accent_color,
    image_url: slide.image_url || '',
  };

  let html = layout.htmlTemplate;
  let css = layout.cssTemplate;

  Object.entries(templateData).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    html = html.replace(regex, value);
    css = css.replace(regex, value);
  });

  return (
    <div className="w-full h-full">
      <style>{css}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
