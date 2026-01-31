// Canvas layer types and interfaces (frontend)

export interface LayerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LayerType = 'primary-image' | 'text' | 'shape' | 'icon' | 'sticker';

export interface TextLayerData {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  align: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export interface ImageLayerData {
  imageUrl?: string;
  userPrompt?: string;
  generationStatus: 'pending' | 'generating' | 'complete' | 'error';
  errorMessage?: string;
}

export interface ShapeLayerData {
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'line';
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface CanvasLayer {
  id: string;
  type: LayerType;
  zIndex: number;
  bounds: LayerBounds;
  visible: boolean;
  locked: boolean;
  opacity: number;
  
  textData?: TextLayerData;
  imageData?: ImageLayerData;
  shapeData?: ShapeLayerData;
  
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CanvasState {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  backgroundColor: string;
  layers: CanvasLayer[];
  version: number;
  createdAt: number;
  updatedAt: number;
  primaryImagePrompt?: string;
  metadata?: {
    brandName?: string;
    brandColors?: string[];
  };
}

export interface CreateCanvasRequest {
  name: string;
  imagePrompt: string; // Required: user's prompt for primary image
  aspectRatio?: string;
  brandName?: string;
  brandColors?: string[];
}

export interface AddLayerRequest {
  canvasId: string;
  layerType: LayerType;
  name?: string;
  // For text layers
  text?: string;
  fontSize?: number;
  color?: string;
  // For shape layers
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line';
  fillColor?: string;
  strokeColor?: string;
  // Position and size
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
