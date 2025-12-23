import { useState, useEffect, useCallback, useRef } from 'react';
import type { Project } from '../types/project';
import type { SaveStatus } from '../lib/storage/types';
import { getStorage } from '../lib/storage';

interface UseAutoSaveOptions {
  /** Delay in ms before auto-saving (default: 2000) */
  delay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save completes */
  onSave?: () => void;
  /** Callback when save fails */
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  /** Current save status */
  saveStatus: SaveStatus;
  /** Trigger immediate save */
  saveNow: () => Promise<void>;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Mark content as changed (triggers auto-save timer) */
  markChanged: () => void;
}

/**
 * Hook for auto-saving projects with debouncing and status indicator
 */
export function useAutoSave(
  project: Project | null,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const { delay = 2000, enabled = true, onSave, onError } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const projectRef = useRef(project);
  const isSavingRef = useRef(false);

  // Keep project ref updated
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Save function
  const save = useCallback(async () => {
    if (!projectRef.current || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const storage = getStorage();
      await storage.saveProject(projectRef.current);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      onSave?.();
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onError]);

  // Mark content as changed
  const markChanged = useCallback(() => {
    if (!enabled) return;

    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer for auto-save
    timerRef.current = setTimeout(() => {
      save();
    }, delay);
  }, [enabled, delay, save]);

  // Watch for project changes
  useEffect(() => {
    if (!project || !enabled) return;

    // Skip initial render
    const isInitialRender = !projectRef.current;
    if (isInitialRender) return;

    markChanged();
  }, [project, enabled, markChanged]);

  // Manual save function
  const saveNow = useCallback(async () => {
    // Clear pending auto-save
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    await save();
  }, [save]);

  // Keyboard shortcut (Cmd/Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveNow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveNow]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (hasUnsavedChanges && projectRef.current) {
        // Synchronous save attempt on unmount
        const storage = getStorage();
        storage.saveProject(projectRef.current).catch(console.error);
      }
    };
  }, [hasUnsavedChanges]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    saveStatus,
    saveNow,
    hasUnsavedChanges,
    markChanged,
  };
}

/**
 * Save status indicator component props
 */
export interface SaveStatusIndicatorProps {
  status: SaveStatus;
  className?: string;
}

/**
 * Get status display text
 */
export function getSaveStatusText(status: SaveStatus): string {
  switch (status) {
    case 'saved':
      return 'Saved';
    case 'saving':
      return 'Saving...';
    case 'unsaved':
      return 'Unsaved changes';
    case 'error':
      return 'Save failed';
  }
}

/**
 * Get status color class
 */
export function getSaveStatusColor(status: SaveStatus): string {
  switch (status) {
    case 'saved':
      return 'text-green-500';
    case 'saving':
      return 'text-yellow-500';
    case 'unsaved':
      return 'text-orange-500';
    case 'error':
      return 'text-red-500';
  }
}
