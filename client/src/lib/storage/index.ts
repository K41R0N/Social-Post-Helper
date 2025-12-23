import { LocalStorageProvider } from './localStorage';
import { FileSystemProvider } from './fileSystem';
import type { StorageProvider } from './types';

export type { StorageProvider } from './types';
export type {
  ExportOptions,
  ExportResult,
  CarouselExport,
  FigmaImportResult,
  SaveStatus,
  AutoSaveConfig,
} from './types';

let storageProvider: StorageProvider | null = null;

/**
 * Get the appropriate storage provider based on the runtime environment
 */
export function getStorage(): StorageProvider {
  if (storageProvider) {
    return storageProvider;
  }

  // Check if running in Electron
  if (typeof window !== 'undefined' && window.electronAPI) {
    console.log('Using FileSystem storage provider (Electron)');
    storageProvider = new FileSystemProvider();
  } else {
    console.log('Using localStorage storage provider (Web)');
    storageProvider = new LocalStorageProvider();
  }

  return storageProvider;
}

/**
 * Check if running in desktop (Electron) mode
 */
export function isDesktop(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI;
}

/**
 * Reset the storage provider (useful for testing)
 */
export function resetStorageProvider(): void {
  storageProvider = null;
}

// Re-export providers for direct use if needed
export { LocalStorageProvider } from './localStorage';
export { FileSystemProvider } from './fileSystem';
