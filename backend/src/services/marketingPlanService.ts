import mongoose from 'mongoose';
import MarketingPlanModel, { IMarketingPlan } from '../models/marketingPlanModel';

class MarketingPlanService {
  /**
   * Save a marketing plan
   */
  async savePlan(data: {
    title: string;
    plan: string;
    brandName?: string;
    campaignName?: string;
    collectedInfo?: any;
  }): Promise<IMarketingPlan> {
    // Check if MongoDB is connected
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not available. Please ensure MongoDB is connected.');
    }

    const plan = new MarketingPlanModel({
      title: data.title,
      plan: data.plan,
      brandName: data.brandName,
      campaignName: data.campaignName,
      collectedInfo: data.collectedInfo || {},
    });

    return await plan.save();
  }

  /**
   * Get all marketing plans
   */
  async getAllPlans(): Promise<IMarketingPlan[]> {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return [];
    }
    return await MarketingPlanModel.find().sort({ createdAt: -1 });
  }

  /**
   * Get a plan by ID
   */
  async getPlanById(id: string): Promise<IMarketingPlan | null> {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return null;
    }
    return await MarketingPlanModel.findById(id);
  }

  /**
   * Delete a plan
   */
  async deletePlan(id: string): Promise<boolean> {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return false;
    }
    const result = await MarketingPlanModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Update a plan
   */
  async updatePlan(id: string, updates: Partial<IMarketingPlan>): Promise<IMarketingPlan | null> {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return null;
    }
    return await MarketingPlanModel.findByIdAndUpdate(id, updates, { new: true });
  }
}

export default new MarketingPlanService();

