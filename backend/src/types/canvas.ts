// Canvas layer types and interfaces

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

export interface ShapeLayerData {
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'line';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface ImageLayerData {
  imageUrl?: string;
  userPrompt?: string; // User's original prompt
  generationStatus: 'pending' | 'generating' | 'complete' | 'error';
  errorMessage?: string;
}

export interface CanvasLayer {
  id: string;
  type: LayerType;
  zIndex: number;
  bounds: LayerBounds;
  visible: boolean;
  locked: boolean;
  opacity: number;
  
  // Layer-specific data
  textData?: TextLayerData;
  imageData?: ImageLayerData;
  shapeData?: ShapeLayerData;
  
  // Metadata
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CanvasState {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string; // e.g., "16:9", "1:1", "9:16"
  backgroundColor: string;
  primaryImagePrompt?: string; // User's prompt for the primary image
  layers: CanvasLayer[];
  version: number;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    brandName?: string;
    brandColors?: string[];
  };
}

export interface RegenerateLayerRequest {
  canvasId: string;
  layerId: string;
  userPrompt?: string; // User's prompt to use
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

export interface ExportCanvasRequest {
  canvasId: string;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
}
