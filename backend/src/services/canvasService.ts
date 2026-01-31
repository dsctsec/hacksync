import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

import {
  CanvasState,
  CanvasLayer,
  CreateCanvasRequest,
  LayerBounds,
} from '../types/canvas';

class CanvasService {
  private genAI: GoogleGenerativeAI;
  private canvasStore: Map<string, CanvasState> = new Map();
  private auth: GoogleAuth;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  /* =========================
     AUTH
  ========================== */

  private async getAccessToken(): Promise<string> {
    const client = await this.auth.getClient();
    const token = await client.getAccessToken();
    if (!token.token) {
      throw new Error('Failed to obtain Google OAuth access token');
    }
    return token.token;
  }

  /* =========================
     CANVAS CORE
  ========================== */

  async createCanvas(request: CreateCanvasRequest): Promise<CanvasState> {
    const canvasId = this.generateId();
    const now = Date.now();
    const dimensions = this.getCanvasDimensions(request.aspectRatio || '1:1');

    // Create canvas with primary image layer
    const canvas: CanvasState = {
      id: canvasId,
      name: request.name,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: request.aspectRatio || '1:1',
      backgroundColor: '#ffffff',
      primaryImagePrompt: request.imagePrompt,
      layers: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
      metadata: {
        brandName: request.brandName,
        brandColors: request.brandColors,
      },
    };

    // Create primary image layer
    const primaryLayer: CanvasLayer = {
      id: this.generateLayerId(),
      type: 'primary-image',
      name: 'Primary Image',
      zIndex: 0,
      bounds: { x: 0, y: 0, width: dimensions.width, height: dimensions.height },
      visible: true,
      locked: false,
      opacity: 1,
      imageData: {
        userPrompt: request.imagePrompt,
        generationStatus: 'pending',
      },
      createdAt: now,
      updatedAt: now,
    };

    canvas.layers.push(primaryLayer);
    this.canvasStore.set(canvasId, canvas);

    // Generate the primary image immediately
    try {
      await this.generateLayerImage(canvasId, primaryLayer.id, request.imagePrompt);
    } catch (error) {
      console.error('Failed to generate primary image:', error);
      // Canvas is still created, just with pending image
    }

    return this.canvasStore.get(canvasId) || canvas;
  }

  async createCanvasWithImage(
    name: string,
    imageBuffer: Buffer,
    imageMimeType: string,
    aspectRatio?: string,
    brandName?: string,
    brandColors?: string[]
  ): Promise<CanvasState> {
    const canvasId = this.generateId();
    const now = Date.now();
    const dimensions = this.getCanvasDimensions(aspectRatio || '1:1');

    // Convert image buffer to base64 data URL
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:${imageMimeType};base64,${base64Image}`;

    // Create canvas with uploaded image
    const canvas: CanvasState = {
      id: canvasId,
      name,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: aspectRatio || '1:1',
      backgroundColor: '#ffffff',
      layers: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
      metadata: {
        brandName,
        brandColors,
      },
    };

    // Create primary image layer with uploaded image
    // The bounds will be adjusted by the frontend renderer to fit the canvas
    const primaryLayer: CanvasLayer = {
      id: this.generateLayerId(),
      type: 'primary-image',
      name: 'Primary Image',
      zIndex: 0,
      bounds: { x: 0, y: 0, width: dimensions.width, height: dimensions.height },
      visible: true,
      locked: false,
      opacity: 1,
      imageData: {
        imageUrl,
        generationStatus: 'complete',
      },
      createdAt: now,
      updatedAt: now,
    };

    canvas.layers.push(primaryLayer);
    this.canvasStore.set(canvasId, canvas);

    return canvas;
  }

  getCanvas(canvasId: string): CanvasState | null {
    return this.canvasStore.get(canvasId) || null;
  }

  updateLayer(
    canvasId: string,
    layerId: string,
    updates: Partial<CanvasLayer>
  ): CanvasState | null {
    const canvas = this.canvasStore.get(canvasId);
    if (!canvas) return null;

    const idx = canvas.layers.findIndex(l => l.id === layerId);
    if (idx === -1) return null;

    canvas.layers[idx] = {
      ...canvas.layers[idx],
      ...updates,
      updatedAt: Date.now(),
    };

    canvas.updatedAt = Date.now();
    canvas.version += 1;
    this.canvasStore.set(canvasId, canvas);
    return canvas;
  }

  addLayer(canvasId: string, layerData: any): CanvasState | null {
    const canvas = this.canvasStore.get(canvasId);
    if (!canvas) return null;

    const now = Date.now();
    const maxZIndex = canvas.layers.reduce((max, l) => Math.max(max, l.zIndex), 0);

    const newLayer: CanvasLayer = {
      id: this.generateLayerId(),
      type: layerData.layerType,
      name: layerData.name || `${layerData.layerType} ${canvas.layers.length + 1}`,
      zIndex: maxZIndex + 1,
      bounds: {
        x: layerData.x || 100,
        y: layerData.y || 100,
        width: layerData.width || 200,
        height: layerData.height || 100,
      },
      visible: true,
      locked: false,
      opacity: 1,
      createdAt: now,
      updatedAt: now,
    };

    // Add layer-specific data
    if (layerData.layerType === 'text') {
      newLayer.textData = {
        text: layerData.text || 'New Text',
        fontSize: layerData.fontSize || 32,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: layerData.color || '#000000',
        align: 'center',
      };
    } else if (layerData.layerType === 'shape') {
      newLayer.shapeData = {
        shapeType: layerData.shapeType || 'rectangle',
        fillColor: layerData.fillColor || '#3b82f6',
        strokeColor: layerData.strokeColor,
        strokeWidth: layerData.strokeWidth || 0,
      };
    }

    canvas.layers.push(newLayer);
    canvas.updatedAt = now;
    canvas.version += 1;
    this.canvasStore.set(canvasId, canvas);

    return canvas;
  }

  deleteLayer(canvasId: string, layerId: string): CanvasState | null {
    const canvas = this.canvasStore.get(canvasId);
    if (!canvas) return null;

    const layer = canvas.layers.find(l => l.id === layerId);
    if (!layer) return null;

    // Don't allow deleting primary image
    if (layer.type === 'primary-image') {
      throw new Error('Cannot delete primary image layer');
    }

    canvas.layers = canvas.layers.filter(l => l.id !== layerId);
    canvas.updatedAt = Date.now();
    canvas.version += 1;
    this.canvasStore.set(canvasId, canvas);

    return canvas;
  }

  /* =========================
     PROMPT GENERATION (Gemini)
  ========================== */

  /* =========================
     IMAGE GENERATION (Vertex Imagen)
  ========================== */

  async generateLayerImage(
    canvasId: string,
    layerId: string,
    userPrompt?: string
  ): Promise<{ imageUrl: string; prompt: string }> {
    const canvas = this.canvasStore.get(canvasId);
    if (!canvas) throw new Error('Canvas not found');

    const layer = canvas.layers.find(l => l.id === layerId);
    if (!layer) throw new Error('Layer not found');

    // Use provided prompt or the layer's existing prompt
    const prompt = userPrompt || layer.imageData?.userPrompt || 'A beautiful image';

    this.updateLayer(canvasId, layerId, {
      imageData: {
        ...layer.imageData,
        userPrompt: prompt,
        generationStatus: 'generating'
      },
    });

    try {
      const imageUrl = await this.generateImageViaImagen(prompt, layer.bounds);

      this.updateLayer(canvasId, layerId, {
        imageData: {
          imageUrl,
          userPrompt: prompt,
          generationStatus: 'complete',
        },
      });

      return { imageUrl, prompt };
    } catch (err: any) {
      this.updateLayer(canvasId, layerId, {
        imageData: {
          ...layer.imageData,
          generationStatus: 'error',
          errorMessage: err.message,
        },
      });
      throw err;
    }
  }

  private async generateImageViaImagen(
    prompt: string,
    bounds: LayerBounds
  ): Promise<string> {
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION || 'us-central1';

    if (!projectId) throw new Error('GCP_PROJECT_ID not set');

    const accessToken = await this.getAccessToken();

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

    const res = await axios.post<{
      predictions?: Array<{
        bytesBase64Encoded?: string;
        mimeType?: string;
      }>;
    }>(
      endpoint,
      {
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: this.getImagenAspectRatio(bounds),
          negativePrompt:
            'blurry, low quality, distorted, watermark, text, words, letters',
          safetyFilterLevel: 'BLOCK_ONLY_HIGH',
          personGeneration: 'ALLOW_ADULT',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const prediction = res.data?.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
      throw new Error('Imagen returned no image data');
    }

    return `data:image/png;base64,${prediction.bytesBase64Encoded}`;
  }

  /* =========================
     HELPERS
  ========================== */

  private getImagenAspectRatio(bounds: LayerBounds): string {
    const r = bounds.width / bounds.height;
    if (r > 1.6) return '16:9';
    if (r < 0.7) return '9:16';
    return '1:1';
  }

  private generateId(): string {
    return `canvas_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private generateLayerId(): string {
    return `layer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private getCanvasDimensions(aspectRatio: string) {
    const map: any = {
      '1:1': { width: 1080, height: 1080 },
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
    };
    return map[aspectRatio] || map['1:1'];
  }

  /* =========================
     CANVAS MANAGEMENT
  ========================== */

  getAllCanvases(): CanvasState[] {
    return Array.from(this.canvasStore.values());
  }

  deleteCanvas(canvasId: string): boolean {
    return this.canvasStore.delete(canvasId);
  }

  exportCanvasState(canvasId: string): string | null {
    const canvas = this.canvasStore.get(canvasId);
    if (!canvas) return null;
    return JSON.stringify(canvas, null, 2);
  }

  importCanvasState(jsonState: string): CanvasState {
    const canvas: CanvasState = JSON.parse(jsonState);
    this.canvasStore.set(canvas.id, canvas);
    return canvas;
  }

  /* =========================
     AI TEXT GENERATION
  ========================== */

  async generateTextWithAI(prompt: string, context?: any): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 1000,
      },
    });

    let fullPrompt = `Generate compelling marketing text based on this request: "${prompt}".`;
    
    if (context?.canvasName) {
      fullPrompt += ` This is for a canvas titled "${context.canvasName}".`;
    }
    
    if (context?.brandName) {
      fullPrompt += ` Brand: ${context.brandName}.`;
    }

    fullPrompt += ` Keep it concise, impactful, and suitable for a visual design.
Return ONLY the text content, no explanations or formatting markers.`;

    const res = await model.generateContent(fullPrompt);
    return res.response.text().trim();
  }

  /**
   * Generate AI element (icon or sticker)
   */
  async generateElement(
    canvasId: string,
    elementType: 'icon' | 'sticker',
    prompt: string,
    bounds: LayerBounds
  ): Promise<CanvasState> {
    const canvas = this.canvasStore.get(canvasId);
    if (!canvas) throw new Error('Canvas not found');

    const now = Date.now();
    const maxZIndex = canvas.layers.reduce((max, l) => Math.max(max, l.zIndex), 0);

    // Create element layer
    const elementLayer: CanvasLayer = {
      id: this.generateLayerId(),
      type: elementType,
      name: `${elementType === 'icon' ? 'Icon' : 'Sticker'} Element`,
      zIndex: maxZIndex + 1,
      bounds,
      visible: true,
      locked: false,
      opacity: 1,
      imageData: {
        userPrompt: prompt,
        generationStatus: 'generating',
      },
      createdAt: now,
      updatedAt: now,
    };

    canvas.layers.push(elementLayer);
    canvas.updatedAt = now;
    canvas.version += 1;
    this.canvasStore.set(canvasId, canvas);

    // Generate the element image
    try {
      // For icons/stickers, use a smaller size and more focused prompt
      const elementPrompt = `${prompt}, ${elementType === 'icon' ? 'simple icon design, minimal, clean, transparent background' : 'sticker design, fun, colorful, transparent background'}`;
      const imageUrl = await this.generateImageViaImagen(elementPrompt, bounds);

      this.updateLayer(canvasId, elementLayer.id, {
        imageData: {
          imageUrl,
          userPrompt: prompt,
          generationStatus: 'complete',
        },
      });
    } catch (error) {
      console.error('Failed to generate element image:', error);
      this.updateLayer(canvasId, elementLayer.id, {
        imageData: {
          ...elementLayer.imageData,
          generationStatus: 'error',
          errorMessage: (error as Error).message,
        },
      });
      throw error;
    }

    return this.canvasStore.get(canvasId) || canvas;
  }
}

export default new CanvasService();
