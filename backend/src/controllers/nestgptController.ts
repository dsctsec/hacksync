import { Request, Response } from 'express';
import nestgptAgentService from '../services/nestgptAgentService';

class NestGptController {
  async chat(req: Request, res: Response) {
    try {
      const { sessionId, message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const result = await nestgptAgentService.processMessage(sessionId, message);
      
      res.json({ 
        success: true, 
        ...result 
      });
    } catch (e: any) {
      console.error('NestGPT chat error:', e);
      res.status(500).json({ error: e.message });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = nestgptAgentService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ 
        success: true, 
        session: {
          id: session.id,
          phase: session.phase,
          collectedInfo: session.collectedInfo,
          messagesCount: session.agentMessages.length,
          createdCanvases: session.createdCanvases,
          hasCampaignPlan: !!session.campaignPlan
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  async resetSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      nestgptAgentService.resetSession(sessionId);
      res.json({ success: true, message: 'Session reset' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}

export default new NestGptController();
