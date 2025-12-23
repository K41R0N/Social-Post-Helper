export interface CustomLayout {
  id: string;
  name: string;
  description: string;
  htmlTemplate: string;
  cssTemplate: string;
  createdAt: string;
  modifiedAt?: string;
  // Figma import metadata
  isFromFigma?: boolean;
  originalSvg?: string;
  detectedFonts?: string[];
  detectedColors?: Record<string, string>;
}

export interface CustomLayoutFormData {
  name: string;
  description: string;
  htmlTemplate: string;
  cssTemplate: string;
}
