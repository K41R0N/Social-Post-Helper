import { getFontSettings } from './fontStorage';

export function injectGlobalFontStyles(): void {
  const fontSettings = getFontSettings();
  let styleElement = document.getElementById('global-font-styles');
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'global-font-styles';
    document.head.appendChild(styleElement);
  }
  
  // Override the hardcoded fonts in LayoutRenderer with CSS variables
  const css = `
    :root {
      --heading-font: ${fontSettings.headingFont};
      --body-font: ${fontSettings.bodyFont};
      --accent-font: ${fontSettings.accentFont};
    }
    
    /* Override Kyrios Standard with heading font */
    * [style*="'Kyrios Standard'"] {
      font-family: var(--heading-font) !important;
    }
    
    /* Override Merriweather with body font */
    * [style*="'Merriweather'"] {
      font-family: var(--body-font) !important;
    }
    
    /* Override Kyrios Text with accent font */
    * [style*="'Kyrios Text'"] {
      font-family: var(--accent-font) !important;
    }
  `;
  
  styleElement.textContent = css;
}

// Call this when font settings change
export function updateGlobalFonts(): void {
  injectGlobalFontStyles();
}
