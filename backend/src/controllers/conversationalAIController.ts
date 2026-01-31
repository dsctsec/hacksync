import { Request, Response } from 'express';
import twilioService from '../services/twilioService';
import twilio from 'twilio';
import { getCallTranscript } from '../services/mediaStreamHandler';

class ConversationalController {
    // Make an outbound call with real-time conversational AI
    public async makeCall(req: Request, res: Response): Promise<void> {
        try {
            const { to } = req.body;
            
            if (!to) {
                res.status(400).json({ error: 'Missing required field: to (phone number to call)' });
                return;
            }
            
            const call = await twilioService.makeConversationalCall(to);
            
            res.json({ 
                success: true, 
                message: 'Conversational AI call initiated successfully',
                callSid: call.sid,
                to,
                status: call.status,
                note: 'The AI will have a real-time conversation using Deepgram + Gemini'
            });
        } catch (error) {
            console.error('Error making call:', error);
            res.status(500).json({ error: 'Failed to initiate call', details: (error as Error).message });
        }
    }

    // Handle incoming call with conversational AI - starts media stream
    public async handleIncomingCall(req: Request, res: Response): Promise<void> {
        try {
            const { From, CallSid } = req.body;
            
            console.log(`Incoming conversational AI call from ${From}, CallSid: ${CallSid}`);
            
            // Create TwiML that starts media stream
            const twiml = new twilio.twiml.VoiceResponse();
            
            // Start media stream to WebSocket
            const baseUrl = process.env.BASE_URL || `https://${req.get('host')}`;
            const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
            
            const connect = twiml.connect();
            connect.stream({
                url: `${wsUrl}/media-stream`,
            });
            
            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            console.error('Error handling incoming call:', error);
            res.status(500).send('Error processing call');
        }
    }

    // Health check endpoint
    public healthCheck(req: Request, res: Response): void {
        res.json({ 
            status: 'ok', 
            message: 'Twilio Conversational AI Sales Agent is running',
            features: [
                'Real-time speech-to-text (Deepgram)',
                'AI conversation (Google Gemini)',
                'Twilio Media Streams'
            ],
            timestamp: new Date().toISOString()
        });
    }

    // Fetch live transcript for a call
    public getCallTranscript(req: Request, res: Response): void {
        const { callSid } = req.params;
        if (!callSid) {
            res.status(400).json({ error: 'Missing callSid' });
            return;
        }

        const transcript = getCallTranscript(callSid);
        res.json({
            success: true,
            callSid,
            transcript,
        });
    }
}

export default new ConversationalController();
