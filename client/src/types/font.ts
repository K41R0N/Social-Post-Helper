export interface CustomFont {
  id: string;
  name: string;
  family: string;
  format: 'ttf' | 'otf' | 'woff' | 'woff2';
  base64Data: string;
  uploadedAt: string;
}

export interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
}

export interface FontSettings {
  headingFont: string; // font-family value
  bodyFont: string;
  accentFont: string;
  googleFonts: string[]; // List of Google Font families to load
}

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  headingFont: "'Roboto', sans-serif",
  bodyFont: "'Merriweather', serif",
  accentFont: "'Roboto', sans-serif",
  googleFonts: ['Roboto'],
};
