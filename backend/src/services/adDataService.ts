import AdDataModel, { IAdData } from '../models/adDataModel';
import { parse } from 'csv-parse/sync';

export interface CSVRow {
  Date: string;
  'Campaign Name': string;
  'Ad Set Name': string;
  'Ad Name': string;
  Impressions: string;
  Clicks: string;
  'Spend (USD)': string;
  'CTR (%)': string;
  'CPC (USD)': string;
  'CPM (USD)': string;
  Conversions: string;
}

export interface PlatformReport {
  platform: string;
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageCPM: number;
  conversionRate: number;
  costPerConversion: number;
  campaignCount: number;
  adSetCount: number;
  adCount: number;
}

export interface OverallReport {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageCPM: number;
  conversionRate: number;
  costPerConversion: number;
  platformReports: PlatformReport[];
  dateRange: {
    start: Date;
    end: Date;
  };
  campaignCount: number;
  adSetCount: number;
  adCount: number;
}

class AdDataService {
  /**
   * Parse CSV file and extract ad data
   */
  async parseCSV(csvBuffer: Buffer): Promise<CSVRow[]> {
    try {
      const csvContent = csvBuffer.toString('utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: false,
      }) as CSVRow[];

      return records;
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract platform from campaign name or infer from context
   */
  private extractPlatform(campaignName: string, adSetName?: string, adName?: string): string {
    const text = `${campaignName} ${adSetName || ''} ${adName || ''}`.toLowerCase();
    
    // Common platform indicators
    if (text.includes('facebook') || text.includes('fb')) return 'Facebook';
    if (text.includes('instagram') || text.includes('ig')) return 'Instagram';
    if (text.includes('twitter') || text.includes('x.com')) return 'Twitter';
    if (text.includes('linkedin')) return 'LinkedIn';
    if (text.includes('tiktok')) return 'TikTok';
    if (text.includes('google') || text.includes('ads')) return 'Google Ads';
    if (text.includes('youtube')) return 'YouTube';
    if (text.includes('pinterest')) return 'Pinterest';
    if (text.includes('snapchat')) return 'Snapchat';
    
    // Default to "Other" if no platform detected
    return 'Other';
  }

  /**
   * Convert CSV row to AdData document
   */
  private convertRowToAdData(row: CSVRow, userId?: string, platformOverride?: string): IAdData {
    const date = new Date(row.Date);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${row.Date}`);
    }

    const platform = platformOverride?.trim()
      ? platformOverride.trim()
      : this.extractPlatform(row['Campaign Name'], row['Ad Set Name'], row['Ad Name']);

    return {
      date,
      campaignName: row['Campaign Name'].trim(),
      adSetName: row['Ad Set Name'].trim(),
      adName: row['Ad Name'].trim(),
      platform,
      impressions: parseInt(row.Impressions.replace(/,/g, '')) || 0,
      clicks: parseInt(row.Clicks.replace(/,/g, '')) || 0,
      spend: parseFloat(row['Spend (USD)'].replace(/,/g, '').replace('$', '')) || 0,
      ctr: parseFloat(row['CTR (%)'].replace(/,/g, '').replace('%', '')) || 0,
      cpc: parseFloat(row['CPC (USD)'].replace(/,/g, '').replace('$', '')) || 0,
      cpm: parseFloat(row['CPM (USD)'].replace(/,/g, '').replace('$', '')) || 0,
      conversions: parseInt(row.Conversions.replace(/,/g, '')) || 0,
      uploadedAt: new Date(),
      userId,
    } as IAdData;
  }

  /**
   * Save ad data from CSV to database
   */
  async saveAdDataFromCSV(
    csvBuffer: Buffer,
    userId?: string,
    platformOverride?: string
  ): Promise<{ saved: number; errors: string[] }> {
    const rows = await this.parseCSV(csvBuffer);
    const errors: string[] = [];
    let saved = 0;

    for (let i = 0; i < rows.length; i++) {
      try {
  const adData = this.convertRowToAdData(rows[i], userId, platformOverride);
        await AdDataModel.create(adData);
        saved++;
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { saved, errors };
  }

  /**
   * Get overall report with platform splits
   */
  async getOverallReport(userId?: string, startDate?: Date, endDate?: Date): Promise<OverallReport> {
    const query: any = {};
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const allData = await AdDataModel.find(query).lean();

    if (allData.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        totalConversions: 0,
        averageCTR: 0,
        averageCPC: 0,
        averageCPM: 0,
        conversionRate: 0,
        costPerConversion: 0,
        platformReports: [],
        dateRange: {
          start: new Date(),
          end: new Date(),
        },
        campaignCount: 0,
        adSetCount: 0,
        adCount: 0,
      };
    }

    // Calculate overall metrics
    const totalImpressions = allData.reduce((sum, d) => sum + d.impressions, 0);
    const totalClicks = allData.reduce((sum, d) => sum + d.clicks, 0);
    const totalSpend = allData.reduce((sum, d) => sum + d.spend, 0);
    const totalConversions = allData.reduce((sum, d) => sum + d.conversions, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const averageCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;

    // Get unique counts
    const uniqueCampaigns = new Set(allData.map(d => d.campaignName));
    const uniqueAdSets = new Set(allData.map(d => `${d.campaignName}-${d.adSetName}`));
    const uniqueAds = new Set(allData.map(d => `${d.campaignName}-${d.adSetName}-${d.adName}`));

    // Get date range
    const dates = allData.map(d => d.date).sort((a, b) => a.getTime() - b.getTime());
    const dateRange = {
      start: dates[0],
      end: dates[dates.length - 1],
    };

    // Group by platform
    const platformMap = new Map<string, IAdData[]>();
    allData.forEach(data => {
      const platform = data.platform;
      if (!platformMap.has(platform)) {
        platformMap.set(platform, []);
      }
      platformMap.get(platform)!.push(data);
    });

    // Calculate platform reports
    const platformReports: PlatformReport[] = Array.from(platformMap.entries()).map(([platform, data]) => {
      const platformImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
      const platformClicks = data.reduce((sum, d) => sum + d.clicks, 0);
      const platformSpend = data.reduce((sum, d) => sum + d.spend, 0);
      const platformConversions = data.reduce((sum, d) => sum + d.conversions, 0);
      const platformCTR = platformImpressions > 0 ? (platformClicks / platformImpressions) * 100 : 0;
      const platformCPC = platformClicks > 0 ? platformSpend / platformClicks : 0;
      const platformCPM = platformImpressions > 0 ? (platformSpend / platformImpressions) * 1000 : 0;
      const platformConversionRate = platformClicks > 0 ? (platformConversions / platformClicks) * 100 : 0;
      const platformCostPerConversion = platformConversions > 0 ? platformSpend / platformConversions : 0;

      const platformCampaigns = new Set(data.map(d => d.campaignName));
      const platformAdSets = new Set(data.map(d => `${d.campaignName}-${d.adSetName}`));
      const platformAds = new Set(data.map(d => `${d.campaignName}-${d.adSetName}-${d.adName}`));

      return {
        platform,
        totalImpressions: platformImpressions,
        totalClicks: platformClicks,
        totalSpend: platformSpend,
        totalConversions: platformConversions,
        averageCTR: platformCTR,
        averageCPC: platformCPC,
        averageCPM: platformCPM,
        conversionRate: platformConversionRate,
        costPerConversion: platformCostPerConversion,
        campaignCount: platformCampaigns.size,
        adSetCount: platformAdSets.size,
        adCount: platformAds.size,
      };
    });

    // Sort platforms by spend (descending)
    platformReports.sort((a, b) => b.totalSpend - a.totalSpend);

    return {
      totalImpressions,
      totalClicks,
      totalSpend,
      totalConversions,
      averageCTR,
      averageCPC,
      averageCPM,
      conversionRate,
      costPerConversion,
      platformReports,
      dateRange,
      campaignCount: uniqueCampaigns.size,
      adSetCount: uniqueAdSets.size,
      adCount: uniqueAds.size,
    };
  }

  /**
   * Get all ad data (with optional filters)
   */
  async getAllAdData(userId?: string, startDate?: Date, endDate?: Date, platform?: string): Promise<IAdData[]> {
    const query: any = {};
    if (userId) query.userId = userId;
    if (platform) query.platform = platform;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    return AdDataModel.find(query).sort({ date: -1 }).lean();
  }

  /**
   * Delete all ad data (for testing/reset)
   */
  async deleteAllAdData(userId?: string): Promise<number> {
    const query: any = {};
    if (userId) query.userId = userId;
    const result = await AdDataModel.deleteMany(query);
    return result.deletedCount || 0;
  }
}

export default new AdDataService();

