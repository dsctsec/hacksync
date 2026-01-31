import { Request, Response } from 'express';
import ConversationalAIService from '../services/conversationalAIService';
import strategyService from '../services/strategyService';

class ChatController {
  public async chat(req: Request, res: Response): Promise<void> {
  try {
      const { message } = req.body || {};
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Missing required field: message' });
        return;
      }

      const service = new ConversationalAIService();
      const reply = await service.getAIResponse(message);

      res.json({ success: true, reply });
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      if (process.env.DEBUG_AI === 'true') {
        res.status(500).json({ error: 'Chat failed', details: (error as Error).stack || (error as Error).message });
      } else {
        res.status(500).json({ error: 'Chat failed', details: (error as Error).message });
      }
    }
  }
}

export default new ChatController();
