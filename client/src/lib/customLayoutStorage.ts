import type { CustomLayout } from '../types/customLayout';

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
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch (error) {
    console.error('Error saving custom layout:', error);
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
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return importedCount;
  } catch (error) {
    console.error('Error importing custom layouts:', error);
    throw new Error('Invalid JSON format');
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
