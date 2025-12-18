/**
 * localStorage Storage Utilities
 *
 * Provides quota checking and storage management functionality
 * to prevent exceeding browser localStorage limits (typically 5-10MB)
 */

export interface StorageQuotaInfo {
  used: number;
  available: number;
  total: number;
  percentUsed: number;
}

/**
 * Estimate localStorage usage in bytes
 * Note: This is an approximation as actual storage may vary by browser
 */
export function getStorageQuota(): StorageQuotaInfo {
  let used = 0;

  // Calculate total size of all localStorage items
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      // Each character is 2 bytes in UTF-16
      used += (localStorage[key].length + key.length) * 2;
    }
  }

  // Most browsers limit localStorage to 5MB (5,242,880 bytes)
  // Some browsers (Safari) may have 10MB limit
  const total = 5 * 1024 * 1024; // 5MB in bytes
  const available = Math.max(0, total - used);
  const percentUsed = (used / total) * 100;

  return {
    used,
    available,
    total,
    percentUsed
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if there's enough space before saving data
 * @param dataSize - Size of data to save in bytes
 * @param threshold - Minimum available space required (default 500KB)
 * @returns true if there's enough space
 */
export function hasEnoughSpace(dataSize: number, threshold: number = 500 * 1024): boolean {
  const quota = getStorageQuota();
  return (quota.available - dataSize) >= threshold;
}

/**
 * Check if storage usage is approaching limit
 * @param warningThreshold - Percentage at which to warn (default 80%)
 * @returns true if usage is above threshold
 */
export function isApproachingLimit(warningThreshold: number = 80): boolean {
  const quota = getStorageQuota();
  return quota.percentUsed >= warningThreshold;
}

/**
 * Estimate size of data before stringifying
 */
export function estimateDataSize(data: any): number {
  try {
    const jsonString = JSON.stringify(data);
    // Each character is 2 bytes in UTF-16
    return jsonString.length * 2;
  } catch (error) {
    console.error('Error estimating data size:', error);
    return 0;
  }
}

/**
 * Safe localStorage setItem with quota checking
 * @throws Error if quota would be exceeded
 */
export function safeSetItem(key: string, value: string): void {
  const dataSize = (key.length + value.length) * 2;

  // Check if there's enough space
  if (!hasEnoughSpace(dataSize)) {
    const quota = getStorageQuota();
    throw new Error(
      `localStorage quota exceeded. Used: ${formatBytes(quota.used)}, ` +
      `Available: ${formatBytes(quota.available)}, ` +
      `Trying to add: ${formatBytes(dataSize)}`
    );
  }

  try {
    localStorage.setItem(key, value);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      const quota = getStorageQuota();
      throw new Error(
        `localStorage quota exceeded. Used: ${formatBytes(quota.used)}, ` +
        `Available: ${formatBytes(quota.available)}`
      );
    }
    throw error;
  }
}

/**
 * Get storage statistics for monitoring
 */
export function getStorageStats(): {
  quota: StorageQuotaInfo;
  formattedUsed: string;
  formattedAvailable: string;
  formattedTotal: string;
  isNearLimit: boolean;
} {
  const quota = getStorageQuota();

  return {
    quota,
    formattedUsed: formatBytes(quota.used),
    formattedAvailable: formatBytes(quota.available),
    formattedTotal: formatBytes(quota.total),
    isNearLimit: isApproachingLimit(80)
  };
}

/**
 * Clear specific storage keys (useful for cleanup)
 */
export function clearStorageByPrefix(prefix: string): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Get all storage keys
 */
export function getAllStorageKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }
  return keys;
}
