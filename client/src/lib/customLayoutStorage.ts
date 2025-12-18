import type { CustomLayout } from '../types/customLayout';
import { ANTI_MARKETING_LAYOUTS } from './antiMarketingLayouts';
import {
  safeSetItem,
  estimateDataSize,
  formatBytes,
  getStorageQuota,
  hasEnoughSpace
} from './storageUtils';

const STORAGE_KEY = 'custom_layouts';

export function getAllCustomLayouts(): CustomLayout[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom layouts:', error);
    return [];
  }
}

export function getCustomLayout(id: string): CustomLayout | null {
  const layouts = getAllCustomLayouts();
  return layouts.find(l => l.id === id) || null;
}

export function saveCustomLayout(layout: CustomLayout): void {
  const layouts = getAllCustomLayouts();
  const index = layouts.findIndex(l => l.id === layout.id);

  layout.modifiedAt = new Date().toISOString();

  if (index >= 0) {
    layouts[index] = layout;
  } else {
    layouts.push(layout);
  }

  // Check storage quota before saving
  const dataSize = estimateDataSize(layouts);
  const quota = getStorageQuota();

  if (!hasEnoughSpace(dataSize)) {
    throw new Error(
      `Cannot save custom layout: localStorage quota would be exceeded.\n\n` +
      `Layout data size: ${formatBytes(dataSize)}\n` +
      `Storage used: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}\n` +
      `Available: ${formatBytes(quota.available)}\n\n` +
      `Try removing some old layouts or projects to free up space.`
    );
  }

  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch (error) {
    console.error('Error saving custom layout:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save custom layout');
  }
}

export function deleteCustomLayout(id: string): void {
  const layouts = getAllCustomLayouts();
  const filtered = layouts.filter(l => l.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom layout:', error);
    throw new Error('Failed to delete custom layout');
  }
}

export function createCustomLayout(
  name: string,
  description: string,
  htmlTemplate: string,
  cssTemplate: string
): CustomLayout {
  const layout: CustomLayout = {
    id: `custom-${Date.now()}`,
    name,
    description,
    htmlTemplate,
    cssTemplate,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };

  saveCustomLayout(layout);
  return layout;
}

export function exportCustomLayouts(): string {
  const layouts = getAllCustomLayouts();
  return JSON.stringify(layouts, null, 2);
}

export function importCustomLayouts(jsonString: string): number {
  try {
    const imported = JSON.parse(jsonString) as CustomLayout[];
    const existing = getAllCustomLayouts();

    // Merge, avoiding duplicates by ID
    const merged = [...existing];
    let importedCount = 0;

    imported.forEach(layout => {
      if (!merged.find(l => l.id === layout.id)) {
        merged.push(layout);
        importedCount++;
      }
    });

    // Check quota before importing
    const dataSize = estimateDataSize(merged);
    if (!hasEnoughSpace(dataSize)) {
      const quota = getStorageQuota();
      throw new Error(
        `Cannot import layouts: would exceed storage quota.\n` +
        `Storage used: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}`
      );
    }

    safeSetItem(STORAGE_KEY, JSON.stringify(merged));
    return importedCount;
  } catch (error) {
    console.error('Error importing custom layouts:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid JSON format');
  }
}

export function seedAntiMarketingLayouts(): void {
  const layouts = getAllCustomLayouts();
  let modified = false;

  ANTI_MARKETING_LAYOUTS.forEach(seedLayout => {
    const existingIndex = layouts.findIndex(l => l.id === seedLayout.id);
    if (existingIndex === -1) {
      // Add new layout if it doesn't exist
      layouts.push(seedLayout);
      modified = true;
    } else {
      // Update existing layout to ensure latest version is used
      layouts[existingIndex] = {
        ...seedLayout,
        createdAt: layouts[existingIndex].createdAt, // Preserve original creation date
        modifiedAt: new Date().toISOString(), // Update modification date
      };
      modified = true;
    }
  });

  if (modified) {
    try {
      safeSetItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch (error) {
      console.error('Error seeding anti-marketing layouts:', error);
      // Don't throw here since this is initialization code
    }
  }
}

// Template variable documentation
export const TEMPLATE_VARIABLES = [
  { name: '{{title}}', description: 'Main title text' },
  { name: '{{subtitle}}', description: 'Subtitle text' },
  { name: '{{body_text}}', description: 'Body/paragraph text' },
  { name: '{{quote}}', description: 'Quote text' },
  { name: '{{background_color}}', description: 'Background color' },
  { name: '{{font_color}}', description: 'Font/text color' },
  { name: '{{accent_color}}', description: 'Accent color for highlights' },
  { name: '{{image_url}}', description: 'Image URL (if provided)' },
];

export const DEFAULT_HTML_TEMPLATE = `<div class="slide-container">
  <h1 class="title">{{title}}</h1>
  <p class="body">{{body_text}}</p>
</div>`;

export const DEFAULT_CSS_TEMPLATE = `.slide-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  background-color: {{background_color}};
  color: {{font_color}};
}

.title {
  font-family: 'Roboto', sans-serif;
  font-size: 48px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
}

.body {
  font-family: 'Merriweather', serif;
  font-size: 20px;
  line-height: 1.6;
  text-align: center;
  max-width: 800px;
}`;
