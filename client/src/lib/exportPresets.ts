export interface ExportPreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'instagram-square',
    name: 'Instagram Post',
    platform: 'Instagram',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Square format for Instagram feed posts',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Vertical format for Instagram Stories and Reels',
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    platform: 'LinkedIn',
    width: 1200,
    height: 1200,
    aspectRatio: '1:1',
    description: 'Square format for LinkedIn posts',
  },
  {
    id: 'twitter-post',
    name: 'Twitter Post',
    platform: 'Twitter',
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
    description: 'Landscape format for Twitter/X posts',
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    platform: 'Facebook',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    description: 'Landscape format for Facebook posts',
  },
  {
    id: 'pinterest-pin',
    name: 'Pinterest Pin',
    platform: 'Pinterest',
    width: 1000,
    height: 1500,
    aspectRatio: '2:3',
    description: 'Vertical format for Pinterest pins',
  },
];

export function getPresetById(id: string): ExportPreset | undefined {
  return EXPORT_PRESETS.find(preset => preset.id === id);
}

export function getDefaultPreset(): ExportPreset {
  return EXPORT_PRESETS[0]; // Instagram Square
}
