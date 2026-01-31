import { Request, Response } from 'express';
import marketingPlanService from '../services/marketingPlanService';

class MarketingPlanController {
  /**
   * Save a marketing plan
   * POST /api/marketing-plans
   */
  async savePlan(req: Request, res: Response): Promise<void> {
    try {
      const { title, plan, brandName, campaignName, collectedInfo } = req.body;

      if (!title || !plan) {
        res.status(400).json({ error: 'Title and plan content are required' });
        return;
      }

      const savedPlan = await marketingPlanService.savePlan({
        title,
        plan,
        brandName,
        campaignName,
        collectedInfo,
      });

      res.json({
        success: true,
        message: 'Marketing plan saved successfully',
        plan: savedPlan,
      });
    } catch (error) {
      console.error('Error saving marketing plan:', error);
      res.status(500).json({
        error: 'Failed to save marketing plan',
        details: (error as Error).message,
      });
    }
  }

  /**
   * Get all marketing plans
   * GET /api/marketing-plans
   */
  async getAllPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await marketingPlanService.getAllPlans();

      res.json({
        success: true,
        count: plans.length,
        plans,
      });
    } catch (error) {
      console.error('Error fetching marketing plans:', error);
      res.status(500).json({
        error: 'Failed to fetch marketing plans',
        details: (error as Error).message,
      });
    }
  }

  /**
   * Get a plan by ID
   * GET /api/marketing-plans/:id
   */
  async getPlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const plan = await marketingPlanService.getPlanById(id);

      if (!plan) {
        res.status(404).json({ error: 'Marketing plan not found' });
        return;
      }

      res.json({
        success: true,
        plan,
      });
    } catch (error) {
      console.error('Error fetching marketing plan:', error);
      res.status(500).json({
        error: 'Failed to fetch marketing plan',
        details: (error as Error).message,
      });
    }
  }

  /**
   * Delete a plan
   * DELETE /api/marketing-plans/:id
   */
  async deletePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await marketingPlanService.deletePlan(id);

      if (!deleted) {
        res.status(404).json({ error: 'Marketing plan not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Marketing plan deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting marketing plan:', error);
      res.status(500).json({
        error: 'Failed to delete marketing plan',
        details: (error as Error).message,
      });
    }
  }
}

export default new MarketingPlanController();

