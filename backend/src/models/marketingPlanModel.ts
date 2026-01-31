import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMarketingPlan extends Document {
  title: string;
  plan: string; // Markdown content
  brandName?: string;
  campaignName?: string;
  collectedInfo?: {
    brandName?: string;
    brandDescription?: string;
    industry?: string;
    campaignGoal?: string;
    targetAudience?: string;
    budget?: string;
    channels?: string[];
    timeline?: string;
    tone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MarketingPlanSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    plan: { type: String, required: true },
    brandName: { type: String },
    campaignName: { type: String },
    collectedInfo: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const MarketingPlanModel: Model<IMarketingPlan> = 
  mongoose.models.MarketingPlan || 
  mongoose.model<IMarketingPlan>('MarketingPlan', MarketingPlanSchema);

export default MarketingPlanModel;

