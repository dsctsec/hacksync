import { Request, Response } from 'express';
import antiCampaignService from '../services/antiCampaignService';

class AntiCampaignController {
  /**
   * Analyze a campaign critically
   * POST /api/anti-campaign/analyze
   */
  async analyzeCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { plan, campaignInfo } = req.body;

      if (!plan) {
        res.status(400).json({ error: 'Campaign plan is required' });
        return;
      }

      const analysis = await antiCampaignService.analyzeCampaign(plan, campaignInfo);

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      console.error('Error analyzing campaign:', error);
      res.status(500).json({
        error: 'Failed to analyze campaign',
        details: (error as Error).message,
      });
    }
  }
}

export default new AntiCampaignController();

