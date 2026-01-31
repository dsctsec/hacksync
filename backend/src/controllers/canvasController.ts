import { Request, Response } from 'express';
import canvasService from '../services/canvasService';
import { CreateCanvasRequest, RegenerateLayerRequest } from '../types/canvas';

class CanvasController {
  /**
   * Create a new canvas
   * POST /api/canvas/create
   */
  async createCanvas(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateCanvasRequest = req.body;
      
      if (!request.name) {
        res.status(400).json({ error: 'Canvas name is required' });
        return;
      }

      if (!request.imagePrompt) {
        res.status(400).json({ error: 'Image prompt is required' });
        return;
      }

      const canvas = await canvasService.createCanvas(request);
      
      res.json({
        success: true,
        message: 'Canvas created successfully',
        canvas
      });
    } catch (error) {
      console.error('Error creating canvas:', error);
      res.status(500).json({ 
        error: 'Failed to create canvas', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Create a new canvas with uploaded image
   * POST /api/canvas/create-with-image
   */
  async createCanvasWithImage(req: Request, res: Response): Promise<void> {
    try {
      const name = req.body.name;
      const aspectRatio = req.body.aspectRatio;
      const brandName = req.body.brandName;
      const brandColors = req.body.brandColors ? JSON.parse(req.body.brandColors) : undefined;
      
      if (!name) {
        res.status(400).json({ error: 'Canvas name is required' });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Image file is required' });
        return;
      }

      if (!file.mimetype.startsWith('image/')) {
        res.status(400).json({ error: 'File must be an image' });
        return;
      }

      const canvas = await canvasService.createCanvasWithImage(
        name,
        file.buffer,
        file.mimetype,
        aspectRatio,
        brandName,
        brandColors
      );
      
      res.json({
        success: true,
        message: 'Canvas created successfully with uploaded image',
        canvas
      });
    } catch (error) {
      console.error('Error creating canvas with image:', error);
      res.status(500).json({ 
        error: 'Failed to create canvas with image', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Get canvas by ID
   * GET /api/canvas/:id
   */
  async getCanvas(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const canvas = canvasService.getCanvas(id);
      
      if (!canvas) {
        res.status(404).json({ error: 'Canvas not found' });
        return;
      }

      res.json({
        success: true,
        canvas
      });
    } catch (error) {
      console.error('Error getting canvas:', error);
      res.status(500).json({ 
        error: 'Failed to get canvas', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Get all canvases
   * GET /api/canvas/list
   */
  async listCanvases(req: Request, res: Response): Promise<void> {
    try {
      const canvases = canvasService.getAllCanvases();
      
      res.json({
        success: true,
        count: canvases.length,
        canvases
      });
    } catch (error) {
      console.error('Error listing canvases:', error);
      res.status(500).json({ 
        error: 'Failed to list canvases', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Update layer properties
   * PUT /api/canvas/:canvasId/layer/:layerId
   */
  async updateLayer(req: Request, res: Response): Promise<void> {
    try {
      const { canvasId, layerId } = req.params;
      const updates = req.body;

      const canvas = canvasService.updateLayer(canvasId, layerId, updates);
      
      if (!canvas) {
        res.status(404).json({ error: 'Canvas or layer not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Layer updated successfully',
        canvas
      });
    } catch (error) {
      console.error('Error updating layer:', error);
      res.status(500).json({ 
        error: 'Failed to update layer', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Add a new layer to a canvas
   * POST /api/canvas/:canvasId/add-layer
   */
  async addLayer(req: Request, res: Response): Promise<void> {
    try {
      const { canvasId } = req.params;
      const layerData = req.body;

      if (!layerData.layerType) {
        res.status(400).json({ error: 'Layer type is required' });
        return;
      }

      const layer = canvasService.addLayer(canvasId, layerData);
      const canvas = canvasService.getCanvas(canvasId);

      res.json({
        success: true,
        message: 'Layer added successfully',
        layer,
        canvas
      });
    } catch (error) {
      console.error('Error adding layer:', error);
      res.status(500).json({ 
        error: 'Failed to add layer', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Delete a layer from a canvas
   * DELETE /api/canvas/:canvasId/layer/:layerId
   */
  async deleteLayer(req: Request, res: Response): Promise<void> {
    try {
      const { canvasId, layerId } = req.params;

      canvasService.deleteLayer(canvasId, layerId);
      const canvas = canvasService.getCanvas(canvasId);

      res.json({
        success: true,
        message: 'Layer deleted successfully',
        canvas
      });
    } catch (error) {
      console.error('Error deleting layer:', error);
      res.status(500).json({ 
        error: 'Failed to delete layer', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Generate image for a specific layer
   * POST /api/canvas/:canvasId/layer/:layerId/generate
   */
  async generateLayerImage(req: Request, res: Response): Promise<void> {
    try {
      const { canvasId, layerId } = req.params;
      const { customPrompt } = req.body;

      const result = await canvasService.generateLayerImage(
        canvasId, 
        layerId, 
        customPrompt
      );

      // Get updated canvas
      const canvas = canvasService.getCanvas(canvasId);
      
      res.json({
        success: true,
        message: 'Layer image generated successfully',
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        canvas
      });
    } catch (error) {
      console.error('Error generating layer image:', error);
      res.status(500).json({ 
        error: 'Failed to generate layer image', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Regenerate a specific layer
   * POST /api/canvas/regenerate-layer
   */
  async regenerateLayer(req: Request, res: Response): Promise<void> {
    try {
      const { canvasId, layerId, userPrompt }: RegenerateLayerRequest = req.body;

      if (!canvasId || !layerId) {
        res.status(400).json({ 
          error: 'Missing required fields: canvasId, layerId' 
        });
        return;
      }

      const result = await canvasService.generateLayerImage(
        canvasId, 
        layerId, 
        userPrompt
      );

      const canvas = canvasService.getCanvas(canvasId);
      
      res.json({
        success: true,
        message: 'Layer regenerated successfully',
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        canvas
      });
    } catch (error) {
      console.error('Error regenerating layer:', error);
      res.status(500).json({ 
        error: 'Failed to regenerate layer', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Export canvas state as JSON
   * GET /api/canvas/:id/export
   */
  async exportCanvas(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const jsonState = canvasService.exportCanvasState(id);
      
      if (!jsonState) {
        res.status(404).json({ error: 'Canvas not found' });
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="canvas_${id}.json"`);
      res.send(jsonState);
    } catch (error) {
      console.error('Error exporting canvas:', error);
      res.status(500).json({ 
        error: 'Failed to export canvas', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Import canvas state from JSON
   * POST /api/canvas/import
   */
  async importCanvas(req: Request, res: Response): Promise<void> {
    try {
      const { jsonState } = req.body;
      
      if (!jsonState) {
        res.status(400).json({ error: 'Missing jsonState in request body' });
        return;
      }

      const canvas = canvasService.importCanvasState(jsonState);
      
      res.json({
        success: true,
        message: 'Canvas imported successfully',
        canvas
      });
    } catch (error) {
      console.error('Error importing canvas:', error);
      res.status(500).json({ 
        error: 'Failed to import canvas', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Delete canvas
   * DELETE /api/canvas/:id
   */
  async deleteCanvas(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = canvasService.deleteCanvas(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Canvas not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Canvas deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting canvas:', error);
      res.status(500).json({ 
        error: 'Failed to delete canvas', 
        details: (error as Error).message 
      });
    }
  }

  /**
   * Generate text content using AI
   * POST /api/canvas/generate-text
   */
  async generateText(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, context } = req.body;

      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      const text = await canvasService.generateTextWithAI(prompt, context);

      res.json({
        success: true,
        text
      });
    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({
        error: 'Failed to generate text',
        details: (error as Error).message
      });
    }
  }

  /**
   * Generate AI element (icon or sticker)
   * POST /api/canvas/:canvasId/generate-element
   */
  async generateElement(req: Request, res: Response): Promise<void> {
    try {
      const { canvasId } = req.params;
      const { elementType, prompt, x, y, width, height } = req.body;

      if (!elementType || !prompt) {
        res.status(400).json({ error: 'Element type and prompt are required' });
        return;
      }

      if (elementType !== 'icon' && elementType !== 'sticker') {
        res.status(400).json({ error: 'Element type must be "icon" or "sticker"' });
        return;
      }

      const bounds = {
        x: x || 100,
        y: y || 100,
        width: width || 200,
        height: height || 200,
      };

      const canvas = await canvasService.generateElement(
        canvasId,
        elementType,
        prompt,
        bounds
      );

      const layer = canvas.layers.find(l => 
        l.type === elementType && 
        l.imageData?.userPrompt === prompt
      );

      res.json({
        success: true,
        message: 'Element generated successfully',
        layer,
        canvas
      });
    } catch (error) {
      console.error('Error generating element:', error);
      res.status(500).json({
        error: 'Failed to generate element',
        details: (error as Error).message
      });
    }
  }
}

export default new CanvasController();
