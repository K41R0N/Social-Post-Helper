import type { Project, ProjectMetadata } from '../types/project';
import {
  safeSetItem,
  estimateDataSize,
  formatBytes,
  getStorageQuota,
  hasEnoughSpace
} from './storageUtils';

const STORAGE_KEY = 'carousel_projects';

export function getAllProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}

export function saveProject(project: Project): void {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === project.id);

  project.modifiedAt = new Date().toISOString();

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  // Check storage quota before saving
  const dataSize = estimateDataSize(projects);
  const quota = getStorageQuota();

  if (!hasEnoughSpace(dataSize)) {
    throw new Error(
      `Cannot save project: localStorage quota would be exceeded.\n\n` +
      `Project data size: ${formatBytes(dataSize)}\n` +
      `Storage used: ${formatBytes(quota.used)} / ${formatBytes(quota.total)}\n` +
      `Available: ${formatBytes(quota.available)}\n\n` +
      `Try removing some old projects or custom fonts to free up space.`
    );
  }

  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving project:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save project');
  }
}

export function deleteProject(id: string): void {
  const projects = getAllProjects();
  const filtered = projects.filter(p => p.id !== id);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
}

export function duplicateProject(id: string): Project {
  const project = getProject(id);
  if (!project) {
    throw new Error('Project not found');
  }
  
  const newProject: Project = {
    ...project,
    id: `${project.id}-copy-${Date.now()}`,
    name: `${project.name} (Copy)`,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
  
  saveProject(newProject);
  return newProject;
}

export function getProjectMetadata(): ProjectMetadata[] {
  const projects = getAllProjects();
  return projects.map(p => ({
    id: p.id,
    name: p.name,
    slideCount: p.carousels.reduce((sum, c) => sum + c.slides.length, 0),
    carouselCount: p.carousels.length,
    createdAt: p.createdAt,
    modifiedAt: p.modifiedAt,
    description: p.description,
  }));
}

export function createNewProject(name: string): Project {
  const project: Project = {
    id: `project-${Date.now()}`,
    name,
    carousels: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
  
  saveProject(project);
  return project;
}

export function renameProject(id: string, newName: string): void {
  const project = getProject(id);
  if (!project) {
    throw new Error('Project not found');
  }
  
  project.name = newName;
  saveProject(project);
}
