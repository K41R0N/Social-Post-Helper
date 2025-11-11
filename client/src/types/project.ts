import type { CarouselData } from './carousel';

export interface Project {
  id: string;
  name: string;
  carousels: CarouselData[];
  createdAt: string;
  modifiedAt: string;
  description?: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  slideCount: number;
  carouselCount: number;
  createdAt: string;
  modifiedAt: string;
  description?: string;
}
