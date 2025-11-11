export interface CustomLayout {
  id: string;
  name: string;
  description: string;
  htmlTemplate: string;
  cssTemplate: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CustomLayoutFormData {
  name: string;
  description: string;
  htmlTemplate: string;
  cssTemplate: string;
}
