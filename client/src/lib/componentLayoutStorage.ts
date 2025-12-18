/**
 * Component Layout Storage
 *
 * Manages schema-based layouts in localStorage with quota checking.
 */

import type { LayoutSchema, LayoutTemplate } from '../types/componentLayout';
import { QUICK_START_TEMPLATES } from './componentLibrary';
import {
  safeSetItem,
  estimateDataSize,
  formatBytes,
  getStorageQuota,
  hasEnoughSpace,
} from './storageUtils';

const STORAGE_KEY = 'component_layouts';

// ============================================================================
// CRUD Operations
// ============================================================================

export function getAllComponentLayouts(): LayoutSchema[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading component layouts:', error);
    return [];
  }
}

export function getComponentLayout(id: string): LayoutSchema | null {
  const layouts = getAllComponentLayouts();
  return layouts.find(l => l.id === id) || null;
}

export function saveComponentLayout(layout: LayoutSchema): void {
  const layouts = getAllComponentLayouts();
  const index = layouts.findIndex(l => l.id === layout.id);

  layout.updatedAt = Date.now();

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
      `Cannot save layout: localStorage quota would be exceeded.\n\n` +
      `Layout data size: ${formatBytes(dataSize)}\n` +
      `Storage used: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}\n` +
      `Available: ${formatBytes(quota.available)}\n\n` +
      `Try removing some old layouts or projects to free up space.`
    );
  }

  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch (error) {
    console.error('Error saving component layout:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save component layout');
  }
}

export function deleteComponentLayout(id: string): void {
  const layouts = getAllComponentLayouts();
  const filtered = layouts.filter(l => l.id !== id);

  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting component layout:', error);
    throw new Error('Failed to delete component layout');
  }
}

export function duplicateComponentLayout(id: string, newName: string): LayoutSchema {
  const original = getComponentLayout(id);
  if (!original) {
    throw new Error('Layout not found');
  }

  const duplicate: LayoutSchema = {
    ...original,
    id: `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: newName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveComponentLayout(duplicate);
  return duplicate;
}

// ============================================================================
// Import/Export
// ============================================================================

export function exportLayoutToJSON(layout: LayoutSchema): string {
  return JSON.stringify(layout, null, 2);
}

export function importLayoutFromJSON(jsonString: string): LayoutSchema {
  try {
    const layout = JSON.parse(jsonString) as LayoutSchema;

    // Validate required fields
    if (!layout.id || !layout.name || !layout.root) {
      throw new Error('Invalid layout schema: missing required fields');
    }

    // Generate new ID to avoid conflicts
    layout.id = `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    layout.createdAt = Date.now();
    layout.updatedAt = Date.now();

    return layout;
  } catch (error) {
    console.error('Error importing layout:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid JSON format');
  }
}

export function exportMultipleLayouts(layoutIds: string[]): string {
  const layouts = layoutIds
    .map(id => getComponentLayout(id))
    .filter((l): l is LayoutSchema => l !== null);

  return JSON.stringify(layouts, null, 2);
}

export function importMultipleLayouts(jsonString: string): number {
  try {
    const imported = JSON.parse(jsonString) as LayoutSchema[];

    if (!Array.isArray(imported)) {
      throw new Error('JSON must be an array of layouts');
    }

    const existing = getAllComponentLayouts();
    let importedCount = 0;

    // Merge with existing, avoiding duplicates by ID
    const merged = [...existing];

    imported.forEach(layout => {
      // Generate new ID to avoid conflicts
      layout.id = `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      layout.createdAt = Date.now();
      layout.updatedAt = Date.now();

      merged.push(layout);
      importedCount++;
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
    console.error('Error importing layouts:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid JSON format');
  }
}

// ============================================================================
// Template Management
// ============================================================================

export function loadTemplate(templateId: string): LayoutSchema | null {
  const template = QUICK_START_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  // Create a new schema from template with unique ID
  const schema: LayoutSchema = {
    ...template.schema,
    id: `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return schema;
}

export function saveTemplateAsLayout(templateId: string, customName?: string): LayoutSchema {
  const schema = loadTemplate(templateId);
  if (!schema) {
    throw new Error('Template not found');
  }

  if (customName) {
    schema.name = customName;
  }

  saveComponentLayout(schema);
  return schema;
}

// ============================================================================
// Search and Filter
// ============================================================================

export function searchLayouts(query: string): LayoutSchema[] {
  const layouts = getAllComponentLayouts();
  const lowerQuery = query.toLowerCase();

  return layouts.filter(layout => {
    return (
      layout.name.toLowerCase().includes(lowerQuery) ||
      layout.description?.toLowerCase().includes(lowerQuery) ||
      layout.category?.toLowerCase().includes(lowerQuery) ||
      layout.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

export function getLayoutsByCategory(category: string): LayoutSchema[] {
  const layouts = getAllComponentLayouts();
  return layouts.filter(layout => layout.category === category);
}

export function getLayoutsByTag(tag: string): LayoutSchema[] {
  const layouts = getAllComponentLayouts();
  return layouts.filter(layout => layout.tags?.includes(tag));
}

// ============================================================================
// Statistics
// ============================================================================

export function getLayoutStats() {
  const layouts = getAllComponentLayouts();
  const dataSize = estimateDataSize(layouts);
  const quota = getStorageQuota();

  const categories = layouts.reduce((acc, layout) => {
    const cat = layout.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalLayouts: layouts.length,
    dataSize,
    categories,
    storageUsed: quota.used,
    storageAvailable: quota.available,
    storageTotal: quota.total,
  };
}

// ============================================================================
// Initialization
// ============================================================================

export function seedQuickStartTemplates(): void {
  const existing = getAllComponentLayouts();

  QUICK_START_TEMPLATES.forEach(template => {
    // Check if template already exists
    const exists = existing.some(layout => layout.name === template.schema.name);

    if (!exists) {
      const schema: LayoutSchema = {
        ...template.schema,
        id: `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      existing.push(schema);
    }
  });

  // Check storage quota before saving
  const dataSize = estimateDataSize(existing);
  const quota = getStorageQuota();

  if (!hasEnoughSpace(dataSize)) {
    const error = new Error(
      `Cannot seed templates: localStorage quota would be exceeded.\n` +
      `Templates size: ${formatBytes(dataSize)}\n` +
      `Storage used: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}\n` +
      `Available: ${formatBytes(quota.available)}`
    );
    console.error('Error seeding quick start templates:', error);
    throw error;
  }

  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Error seeding quick start templates:', error);
    if (error instanceof Error && error.message.includes('quota')) {
      throw error;
    }
    // Only silently fail for non-quota errors during initialization
  }
}
