import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdData extends Document {
  date: Date;
  campaignName: string;
  adSetName: string;
  adName: string;
  platform: string; // Extracted from campaign name or inferred
  impressions: number;
  clicks: number;
  spend: number; // in USD
  ctr: number; // percentage
  cpc: number; // in USD
  cpm: number; // in USD
  conversions: number;
  uploadedAt: Date;
  userId?: string; // Optional: for multi-user support
}

const AdDataSchema: Schema = new Schema(
  {
    date: { type: Date, required: true, index: true },
    campaignName: { type: String, required: true, index: true },
    adSetName: { type: String, required: true },
    adName: { type: String, required: true },
    platform: { type: String, required: true, index: true },
    impressions: { type: Number, required: true, default: 0 },
    clicks: { type: Number, required: true, default: 0 },
    spend: { type: Number, required: true, default: 0 },
    ctr: { type: Number, required: true, default: 0 },
    cpc: { type: Number, required: true, default: 0 },
    cpm: { type: Number, required: true, default: 0 },
    conversions: { type: Number, required: true, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
    userId: { type: String, index: true },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
AdDataSchema.index({ date: 1, platform: 1 });
AdDataSchema.index({ campaignName: 1, date: 1 });
AdDataSchema.index({ platform: 1, date: 1 });

const AdDataModel: Model<IAdData> = mongoose.models.AdData || mongoose.model<IAdData>('AdData', AdDataSchema);

export default AdDataModel;

