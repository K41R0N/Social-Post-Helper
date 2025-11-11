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
  headingFont: "'Kyrios Standard', serif",
  bodyFont: "'Merriweather', serif",
  accentFont: "'Kyrios Text', sans-serif",
  googleFonts: [],
};
