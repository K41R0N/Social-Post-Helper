import type { CustomFont, FontSettings } from '../types/font';
import { DEFAULT_FONT_SETTINGS } from '../types/font';
import {
  safeSetItem,
  estimateDataSize,
  formatBytes,
  getStorageQuota,
  hasEnoughSpace
} from './storageUtils';

const CUSTOM_FONTS_KEY = 'custom_fonts';
const FONT_SETTINGS_KEY = 'font_settings';

// Custom Fonts Management
export function getAllCustomFonts(): CustomFont[] {
  try {
    const stored = localStorage.getItem(CUSTOM_FONTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom fonts:', error);
    return [];
  }
}

export function saveCustomFont(font: CustomFont): void {
  const fonts = getAllCustomFonts();
  const existing = fonts.findIndex(f => f.id === font.id);

  if (existing >= 0) {
    fonts[existing] = font;
  } else {
    fonts.push(font);
  }

  // Check storage quota before saving
  const dataSize = estimateDataSize(fonts);
  const quota = getStorageQuota();

  if (!hasEnoughSpace(dataSize)) {
    throw new Error(
      `Cannot save font: localStorage quota would be exceeded.\n\n` +
      `Font size: ${formatBytes(dataSize)}\n` +
      `Storage used: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}\n` +
      `Available: ${formatBytes(quota.available)}\n\n` +
      `Try removing some custom fonts or projects to free up space.`
    );
  }

  try {
    safeSetItem(CUSTOM_FONTS_KEY, JSON.stringify(fonts));
  } catch (error) {
    console.error('Error saving custom font:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save font. File may be too large.');
  }
}

export function deleteCustomFont(id: string): void {
  const fonts = getAllCustomFonts();
  const filtered = fonts.filter(f => f.id !== id);
  
  try {
    localStorage.setItem(CUSTOM_FONTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom font:', error);
    throw new Error('Failed to delete font');
  }
}

export async function uploadFont(file: File): Promise<CustomFont> {
  // Warn if file is very large (>1MB)
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > 1) {
    const quota = getStorageQuota();
    console.warn(
      `Large font file detected: ${fileSizeMB.toFixed(2)}MB. ` +
      `Current storage: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}`
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const base64Data = e.target?.result as string;
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!extension || !['ttf', 'otf', 'woff', 'woff2'].includes(extension)) {
          reject(new Error('Unsupported font format. Please use TTF, OTF, WOFF, or WOFF2.'));
          return;
        }

        const fontName = file.name.replace(/\.[^/.]+$/, '');
        const fontFamily = fontName.replace(/[-_]/g, ' ');

        const font: CustomFont = {
          id: `font-${Date.now()}`,
          name: fontName,
          family: fontFamily,
          format: extension as 'ttf' | 'otf' | 'woff' | 'woff2',
          base64Data,
          uploadedAt: new Date().toISOString(),
        };

        // Estimate size of this font
        const estimatedSize = estimateDataSize(font);
        console.log(`Font "${fontName}" estimated size: ${formatBytes(estimatedSize)}`);

        saveCustomFont(font);
        resolve(font);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read font file'));
    reader.readAsDataURL(file);
  });
}

export function generateFontFaceCSS(font: CustomFont): string {
  const formatMap = {
    ttf: 'truetype',
    otf: 'opentype',
    woff: 'woff',
    woff2: 'woff2',
  };
  
  return `@font-face {
  font-family: '${font.family}';
  src: url('${font.base64Data}') format('${formatMap[font.format]}');
  font-weight: normal;
  font-style: normal;
}`;
}

export function injectCustomFonts(): void {
  const fonts = getAllCustomFonts();
  let styleElement = document.getElementById('custom-fonts-style');
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'custom-fonts-style';
    document.head.appendChild(styleElement);
  }
  
  const css = fonts.map(generateFontFaceCSS).join('\n\n');
  styleElement.textContent = css;
}

// Font Settings Management
export function getFontSettings(): FontSettings {
  try {
    const stored = localStorage.getItem(FONT_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_FONT_SETTINGS;
  } catch (error) {
    console.error('Error loading font settings:', error);
    return DEFAULT_FONT_SETTINGS;
  }
}

export function saveFontSettings(settings: FontSettings): void {
  try {
    safeSetItem(FONT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving font settings:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save font settings');
  }
}

export function addGoogleFont(family: string): void {
  const settings = getFontSettings();
  if (!settings.googleFonts.includes(family)) {
    settings.googleFonts.push(family);
    saveFontSettings(settings);
  }
}

export function removeGoogleFont(family: string): void {
  const settings = getFontSettings();
  settings.googleFonts = settings.googleFonts.filter(f => f !== family);
  saveFontSettings(settings);
}

export function getGoogleFontsLink(): string {
  const settings = getFontSettings();
  if (settings.googleFonts.length === 0) return '';
  
  const families = settings.googleFonts.map(f => f.replace(/ /g, '+')).join('&family=');
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

export function injectGoogleFonts(): void {
  const link = getGoogleFontsLink();
  let linkElement = document.getElementById('google-fonts-link') as HTMLLinkElement;
  
  if (!linkElement && link) {
    linkElement = document.createElement('link');
    linkElement.id = 'google-fonts-link';
    linkElement.rel = 'stylesheet';
    document.head.appendChild(linkElement);
  }
  
  if (linkElement) {
    if (link) {
      linkElement.href = link;
    } else {
      linkElement.remove();
    }
  }
}

// Initialize fonts on app load
export function initializeFonts(): void {
  injectCustomFonts();
  injectGoogleFonts();
}
