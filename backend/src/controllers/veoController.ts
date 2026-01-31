import { Request, Response } from "express";
import veoService from "../services/veoService";
import { VeoGenerateRequest } from "../types/veo";

class VeoController {
  /**
   * Tune prompt for Veo 3 generation
   * POST /api/veo/tune
   */
  async tunePrompt(req: Request, res: Response): Promise<void> {
    try {
      const request: VeoGenerateRequest = req.body;

      if (!request?.prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }

      const tunedPrompt = veoService.tunePrompt(request);

      res.json({
        success: true,
        tunedPrompt,
      });
    } catch (error) {
      console.error("Error tuning Veo prompt:", error);
      res.status(500).json({
        error: "Failed to tune prompt",
        details: (error as Error).message,
      });
    }
  }

  /**
   * Generate video using Veo 3
   * POST /api/veo/generate
   */
  async generateVideo(req: Request, res: Response): Promise<void> {
    try {
      const request: VeoGenerateRequest = req.body;

      if (!request?.prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }

      const result = await veoService.generateVideo(request);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error generating Veo video:", error);
      res.status(500).json({
        error: "Failed to generate video",
        details: (error as Error).message,
      });
    }
  }
}

export default new VeoController();
