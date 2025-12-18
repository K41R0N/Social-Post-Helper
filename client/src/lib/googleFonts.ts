import axios from 'axios';
import type { GoogleFont } from '../types/font';

// Get API key from environment variables
// To use Google Fonts API, add VITE_GOOGLE_FONTS_API_KEY to your .env file
const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY || '';
const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

let cachedFonts: GoogleFont[] | null = null;

export async function fetchGoogleFonts(): Promise<GoogleFont[]> {
  if (cachedFonts) {
    return cachedFonts;
  }

  // If no API key is configured, return popular fonts fallback
  if (!GOOGLE_FONTS_API_KEY) {
    console.warn(
      'Google Fonts API key not configured. Using fallback list of popular fonts.\n' +
      'To enable full Google Fonts integration, add VITE_GOOGLE_FONTS_API_KEY to your .env file.\n' +
      'Get your API key at: https://console.cloud.google.com/apis/credentials'
    );
    return getPopularFonts();
  }

  try {
    const response = await axios.get(GOOGLE_FONTS_API_URL, {
      params: {
        key: GOOGLE_FONTS_API_KEY,
        sort: 'popularity',
      },
    });

    const fonts: GoogleFont[] = response.data.items.map((item: any) => ({
      family: item.family,
      variants: item.variants,
      category: item.category,
    }));

    cachedFonts = fonts;
    return fonts;
  } catch (error) {
    console.error('Error fetching Google Fonts:', error);
    console.warn('Falling back to popular fonts list');
    // Return popular fonts as fallback
    return getPopularFonts();
  }
}

export function searchGoogleFonts(query: string, fonts: GoogleFont[]): GoogleFont[] {
  if (!query.trim()) return fonts.slice(0, 50); // Return top 50 if no query
  
  const lowerQuery = query.toLowerCase();
  return fonts.filter(font => 
    font.family.toLowerCase().includes(lowerQuery)
  ).slice(0, 50);
}

export function getPopularFonts(): GoogleFont[] {
  return [
    { family: 'Roboto', variants: ['100', '300', '400', '500', '700', '900'], category: 'sans-serif' },
    { family: 'Open Sans', variants: ['300', '400', '500', '600', '700', '800'], category: 'sans-serif' },
    { family: 'Lato', variants: ['100', '300', '400', '700', '900'], category: 'sans-serif' },
    { family: 'Montserrat', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], category: 'sans-serif' },
    { family: 'Oswald', variants: ['200', '300', '400', '500', '600', '700'], category: 'sans-serif' },
    { family: 'Source Sans Pro', variants: ['200', '300', '400', '600', '700', '900'], category: 'sans-serif' },
    { family: 'Raleway', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], category: 'sans-serif' },
    { family: 'Poppins', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], category: 'sans-serif' },
    { family: 'Merriweather', variants: ['300', '400', '700', '900'], category: 'serif' },
    { family: 'PT Sans', variants: ['400', '700'], category: 'sans-serif' },
    { family: 'Playfair Display', variants: ['400', '500', '600', '700', '800', '900'], category: 'serif' },
    { family: 'Lora', variants: ['400', '500', '600', '700'], category: 'serif' },
    { family: 'Nunito', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], category: 'sans-serif' },
    { family: 'Ubuntu', variants: ['300', '400', '500', '700'], category: 'sans-serif' },
    { family: 'Roboto Condensed', variants: ['300', '400', '700'], category: 'sans-serif' },
    { family: 'Inter', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], category: 'sans-serif' },
    { family: 'Work Sans', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], category: 'sans-serif' },
    { family: 'Bebas Neue', variants: ['400'], category: 'display' },
    { family: 'Crimson Text', variants: ['400', '600', '700'], category: 'serif' },
    { family: 'Quicksand', variants: ['300', '400', '500', '600', '700'], category: 'sans-serif' },
  ];
}

export function getFontPreviewUrl(family: string): string {
  const encodedFamily = encodeURIComponent(family);
  return `https://fonts.googleapis.com/css2?family=${encodedFamily.replace(/%20/g, '+')}:wght@400;700&display=swap`;
}
