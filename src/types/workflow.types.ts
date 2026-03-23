export interface ImageData {
  id: string;
  name: string;
  data: string; // base64 data
  mimeType: string;
  width?: number;
  height?: number;
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  font?: string;
  fontSize?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface ParagraphStyle {
  marginTop?: string;
  marginBottom?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  indent?: string;
}

export interface InteractiveFlow {
  id: string;
  name: string;
  type: string;
  interactiveType: string;
  node: Element;
  flowContent: Element | null;
  textContent: string;
  images?: ImageData[];
  textStyle?: TextStyle;
  paragraphStyle?: ParagraphStyle;
}

export interface WorkflowData {
  flows: InteractiveFlow[];
  xmlDoc: Document | null;
  fileName: string;
}