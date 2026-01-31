import WebSocket from 'ws';
import { ConversationalAIService } from '../services/conversationalAIService';

interface CallSession {
    callSid: string;
    streamSid: string;
    aiService: ConversationalAIService;
    isActive: boolean;
    transcript: Array<{ role: 'user' | 'assistant'; text: string; timestamp: number }>;
}

const activeSessions = new Map<string, CallSession>();
const recentTranscripts = new Map<string, { transcript: CallSession['transcript']; endedAt: number }>();

const MAX_TRANSCRIPT_ENTRIES = 200;

const appendTranscript = (
    session: CallSession,
    entry: { role: 'user' | 'assistant'; text: string; timestamp: number },
) => {
    session.transcript.push(entry);
    if (session.transcript.length > MAX_TRANSCRIPT_ENTRIES) {
        session.transcript.splice(0, session.transcript.length - MAX_TRANSCRIPT_ENTRIES);
    }
};

const archiveSession = (callSid: string) => {
    const session = activeSessions.get(callSid);
    if (session) {
        recentTranscripts.set(callSid, {
            transcript: session.transcript,
            endedAt: Date.now(),
        });
        activeSessions.delete(callSid);
    }
};

export function handleMediaStream(ws: WebSocket) {
    console.log('New WebSocket connection established');
    
    let callSid: string;
    let streamSid: string;
    let aiService: ConversationalAIService;

    ws.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);

            switch (data.event) {
                case 'start':
                    callSid = data.start.callSid;
                    streamSid = data.start.streamSid;
                    
                    console.log(`Media stream started for call ${callSid}`);
                    
                    // Initialize AI service
                    aiService = new ConversationalAIService();
                    aiService.setTwilioWebSocket(ws, streamSid);
                    await aiService.startDeepgramConnection();

                    aiService.on('transcript', (text: string) => {
                        const session = activeSessions.get(callSid);
                        if (session) {
                            appendTranscript(session, {
                                role: 'user',
                                text,
                                timestamp: Date.now(),
                            });
                        }
                    });

                    aiService.on('ai-response', (text: string) => {
                        const session = activeSessions.get(callSid);
                        if (session) {
                            appendTranscript(session, {
                                role: 'assistant',
                                text,
                                timestamp: Date.now(),
                            });
                        }
                    });
                    
                    // Store session
                    activeSessions.set(callSid, {
                        callSid,
                        streamSid,
                        aiService,
                        isActive: true,
                        transcript: []
                    });

                    // Send initial greeting - Etarra Coffee Shop pitch
                    const greeting = "Hi there! This is Aria calling from Etarra Coffee Shop in Bandra, Mumbai. We're a specialty coffee shop serving amazing single-origin pour overs and artisanal pastries. How are you doing today?";
                    await aiService.generateAndSendTTS(greeting);

                    const session = activeSessions.get(callSid);
                    if (session) {
                        appendTranscript(session, {
                            role: 'assistant',
                            text: greeting,
                            timestamp: Date.now(),
                        });
                    }

                    break;

                case 'media':
                    // Forward audio to Deepgram (already in mulaw format from Twilio)
                    if (aiService && data.media.payload) {
                        const audioBuffer = Buffer.from(data.media.payload, 'base64');
                        aiService.sendAudioToDeepgram(audioBuffer);
                    }
                    break;

                case 'stop':
                    console.log(`Media stream stopped for call ${callSid}`);
                    if (aiService) {
                        aiService.close();
                    }
                    archiveSession(callSid);
                    break;

                default:
                    // Handle other events if needed
                    break;
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        if (aiService) {
            aiService.close();
        }
        if (callSid) {
            archiveSession(callSid);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

export { activeSessions };

export const getCallTranscript = (callSid: string) => {
    const active = activeSessions.get(callSid);
    if (active) return active.transcript;
    const recent = recentTranscripts.get(callSid);
    return recent?.transcript ?? [];
};
