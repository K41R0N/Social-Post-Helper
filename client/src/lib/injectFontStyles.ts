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
    
    /* Override Roboto with heading font */
    * [style*="'Roboto'"] {
      font-family: var(--heading-font) !important;
    }
    
    /* Override Merriweather with body font */
    * [style*="'Merriweather'"] {
      font-family: var(--body-font) !important;
    }
  `;
  
  styleElement.textContent = css;
}

// Call this when font settings change
export function updateGlobalFonts(): void {
  injectGlobalFontStyles();
}
