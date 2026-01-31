import { Request, Response } from 'express';
import adDataService from '../services/adDataService';

class AdDataController {
  /**
   * Upload CSV file with ad data
   * POST /api/ads/upload
   */
  async uploadCSV(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No CSV file provided' });
        return;
      }

  const userId = (req as any).userId || (req.session as any)?.userId; // Optional user ID
  const platform = typeof req.body?.platform === 'string' ? req.body.platform : undefined;
  const result = await adDataService.saveAdDataFromCSV(req.file.buffer, userId, platform);

      res.json({
        success: true,
        message: `Successfully imported ${result.saved} records`,
        saved: result.saved,
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    } catch (error) {
      console.error('Error uploading CSV:', error);
      res.status(500).json({
        error: 'Failed to upload CSV',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get overall report with platform splits
   * GET /api/ads/report
   */
  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId || (req.session as any)?.userId;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      if (startDate && isNaN(startDate.getTime())) {
        res.status(400).json({ error: 'Invalid startDate format' });
        return;
      }

      if (endDate && isNaN(endDate.getTime())) {
        res.status(400).json({ error: 'Invalid endDate format' });
        return;
      }

      const report = await adDataService.getOverallReport(userId, startDate, endDate);

      res.json({
        success: true,
        report,
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({
        error: 'Failed to fetch report',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all ad data (with optional filters)
   * GET /api/ads/data
   */
  async getAdData(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId || (req.session as any)?.userId;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const platform = req.query.platform as string | undefined;

      if (startDate && isNaN(startDate.getTime())) {
        res.status(400).json({ error: 'Invalid startDate format' });
        return;
      }

      if (endDate && isNaN(endDate.getTime())) {
        res.status(400).json({ error: 'Invalid endDate format' });
        return;
      }

      const data = await adDataService.getAllAdData(userId, startDate, endDate, platform);

      res.json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      console.error('Error fetching ad data:', error);
      res.status(500).json({
        error: 'Failed to fetch ad data',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete all ad data (for testing/reset)
   * DELETE /api/ads/data
   */
  async deleteAllAdData(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId || (req.session as any)?.userId;
      const deletedCount = await adDataService.deleteAllAdData(userId);

      res.json({
        success: true,
        message: `Deleted ${deletedCount} records`,
        deletedCount,
      });
    } catch (error) {
      console.error('Error deleting ad data:', error);
      res.status(500).json({
        error: 'Failed to delete ad data',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new AdDataController();

