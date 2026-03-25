export interface ImageData {
  id: string;
  name: string;
  data: string; // This stores the file path for Inspire XML
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
  textStyleId?: string;  // ID reference to TextStyle from XML
  paragraphStyleId?: string;  // ID reference to ParaStyle from XML
  textStyle?: TextStyle;  // For backward compatibility
  paragraphStyle?: ParagraphStyle;  // For backward compatibility
}

export interface WorkflowData {
  flows: InteractiveFlow[];
  xmlDoc: Document | null;
  fileName: string;
}