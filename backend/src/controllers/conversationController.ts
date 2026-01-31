import { Request, Response } from 'express';
import twilioService from '../services/twilioService';
import twilio from 'twilio';

class ConversationController {
    // Handle incoming voice call from Twilio webhook
    public async handleIncomingCall(req: Request, res: Response): Promise<void> {
        try {
            const { From, CallSid } = req.body;
            
            console.log(`Incoming call from ${From}, CallSid: ${CallSid}`);
            
            // Create TwiML voice response with initial greeting
            const twiml = new twilio.twiml.VoiceResponse();
            
            const gather = twiml.gather({
                input: ['speech', 'dtmf'],
                timeout: 3,
                speechTimeout: 'auto',
                action: '/api/webhook/voice/gather',
                method: 'POST',
            });
            
            gather.say(
                "Hello! Welcome to our sales team. I'm your virtual sales assistant. " +
                "How can I help you today? You can ask about our products, pricing, or request a demo."
            );
            
            // If no input, repeat the prompt
            twiml.redirect('/api/webhook/voice');
            
            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            console.error('Error handling incoming call:', error);
            res.status(500).send('Error processing call');
        }
    }

    // Handle speech/DTMF input from caller
    public async handleGather(req: Request, res: Response): Promise<void> {
        try {
            const { SpeechResult, Digits, From } = req.body;
            const userInput = SpeechResult || Digits || '';
            
            console.log(`User input from ${From}: ${userInput}`);
            
            // Process the input and get appropriate response
            const response = twilioService.processVoiceInput(userInput);
            
            // Create TwiML response
            const twiml = new twilio.twiml.VoiceResponse();
            
            // Speak the response
            twiml.say(response.message);
            
            // If conversation should continue, gather more input
            if (!response.endCall) {
                const gather = twiml.gather({
                    input: ['speech', 'dtmf'],
                    timeout: 3,
                    speechTimeout: 'auto',
                    action: '/api/webhook/voice/gather',
                    method: 'POST',
                });
                
                gather.say("Is there anything else I can help you with?");
                
                // If no response, thank and hang up
                twiml.say("Thank you for calling. Have a great day!");
                twiml.hangup();
            } else {
                twiml.say("Thank you for calling. Goodbye!");
                twiml.hangup();
            }
            
            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            console.error('Error handling gather:', error);
            const twiml = new twilio.twiml.VoiceResponse();
            twiml.say("I'm sorry, I encountered an error. Please try again later. Goodbye.");
            twiml.hangup();
            res.type('text/xml');
            res.send(twiml.toString());
        }
    }

    // Make an outbound call with sales pitch
    public async makeCall(req: Request, res: Response): Promise<void> {
        try {
            const { to } = req.body;
            
            if (!to) {
                res.status(400).json({ error: 'Missing required field: to (phone number to call)' });
                return;
            }
            
            const call = await twilioService.makeSalesPitchCall(to);
            
            res.json({ 
                success: true, 
                message: 'Sales call initiated successfully',
                callSid: call.sid,
                to,
                status: call.status
            });
        } catch (error) {
            console.error('Error making call:', error);
            res.status(500).json({ error: 'Failed to initiate call', details: (error as Error).message });
        }
    }

    // Handle the outbound sales pitch when call is answered
    public async handleSalesPitch(req: Request, res: Response): Promise<void> {
        try {
            const { CallSid, To } = req.body;
            
            console.log(`Delivering sales pitch to ${To}, CallSid: ${CallSid}`);
            
            // Create TwiML response with sales pitch
            const twiml = new twilio.twiml.VoiceResponse();
            
            // Initial sales pitch
            twiml.say(
                "Hello! Thanks for your interest in our products. " +
                "I'm calling from your favorite software company to tell you about our amazing solutions. " +
                "We offer three incredible products: " +
                "A powerful C R M tool to manage your customer relationships, " +
                "an advanced analytics platform for data-driven insights, " +
                "and cutting-edge automation software to streamline your business operations."
            );
            
            twiml.pause({ length: 1 });
            
            // Pricing information
            twiml.say(
                "Our pricing is very competitive, starting at just 99 dollars for the basic package, " +
                "499 dollars for our professional tier, " +
                "and 999 dollars for our full enterprise solution with all features included."
            );
            
            twiml.pause({ length: 1 });
            
            // Gather interest
            const gather = twiml.gather({
                input: ['speech', 'dtmf'],
                timeout: 5,
                speechTimeout: 'auto',
                action: '/api/webhook/pitch/response',
                method: 'POST',
                numDigits: 1
            });
            
            gather.say(
                "Would you like to hear more about any of these products? " +
                "Press 1 or say yes for more information. " +
                "Press 2 or say no if you'd like us to call back later."
            );
            
            // If no input, leave a message
            twiml.say("No problem! We'll send you more information via email. Have a great day!");
            twiml.hangup();
            
            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            console.error('Error in sales pitch:', error);
            const twiml = new twilio.twiml.VoiceResponse();
            twiml.say("We'll call you back later. Thank you!");
            twiml.hangup();
            res.type('text/xml');
            res.send(twiml.toString());
        }
    }

    // Handle response to sales pitch
    public async handlePitchResponse(req: Request, res: Response): Promise<void> {
        try {
            const { SpeechResult, Digits } = req.body;
            const userInput = (SpeechResult || Digits || '').toLowerCase();
            
            console.log(`Pitch response: ${userInput}`);
            
            const twiml = new twilio.twiml.VoiceResponse();
            
            // Check if interested
            if (userInput.includes('yes') || userInput.includes('1') || userInput.includes('interested') || userInput.includes('sure')) {
                twiml.say(
                    "Fantastic! I'm so glad you're interested. " +
                    "Let me give you more details about each product."
                );
                
                twiml.pause({ length: 1 });
                
                twiml.say(
                    "Our C R M tool helps you track all customer interactions in one place, " +
                    "automate follow-ups, and never miss an opportunity. " +
                    "The analytics platform gives you real-time dashboards, predictive insights, " +
                    "and custom reports that drive smarter decisions. " +
                    "And our automation software eliminates repetitive tasks, " +
                    "saving you hours every week while reducing errors."
                );
                
                twiml.pause({ length: 1 });
                
                const gather = twiml.gather({
                    input: ['speech', 'dtmf'],
                    timeout: 5,
                    speechTimeout: 'auto',
                    action: '/api/webhook/pitch/demo',
                    method: 'POST',
                });
                
                gather.say(
                    "Would you like to schedule a free demo? " +
                    "Say yes or press 1 to schedule now. " +
                    "Say no or press 2 if you'd like more time to think."
                );
                
                twiml.say("Alright, we'll send you our information packet. Talk soon!");
                twiml.hangup();
            } else {
                twiml.say(
                    "No problem at all! We understand you might need more time. " +
                    "We'll send you a detailed brochure via email, " +
                    "and feel free to reach out anytime. Thank you for your time. Goodbye!"
                );
                twiml.hangup();
            }
            
            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            console.error('Error handling pitch response:', error);
            const twiml = new twilio.twiml.VoiceResponse();
            twiml.say("Thank you for your time. Goodbye!");
            twiml.hangup();
            res.type('text/xml');
            res.send(twiml.toString());
        }
    }

    // Handle demo scheduling request
    public async handleDemoRequest(req: Request, res: Response): Promise<void> {
        try {
            const { SpeechResult, Digits } = req.body;
            const userInput = (SpeechResult || Digits || '').toLowerCase();
            
            const twiml = new twilio.twiml.VoiceResponse();
            
            if (userInput.includes('yes') || userInput.includes('1')) {
                twiml.say(
                    "Excellent! A member of our sales team will call you back within 24 hours " +
                    "to schedule your personalized demo at a time that works best for you. " +
                    "You can also visit our website to book immediately. " +
                    "Thank you so much for your interest, and we look forward to showing you " +
                    "how our solutions can transform your business. Have a wonderful day!"
                );
            } else {
                twiml.say(
                    "That's perfectly fine. Take all the time you need. " +
                    "We've sent you all the information, and you can reach out whenever you're ready. " +
                    "Thank you for listening, and have a great day!"
                );
            }
            
            twiml.hangup();
            
            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            console.error('Error handling demo request:', error);
            const twiml = new twilio.twiml.VoiceResponse();
            twiml.say("Thank you! Goodbye!");
            twiml.hangup();
            res.type('text/xml');
            res.send(twiml.toString());
        }
    }

    // Health check endpoint
    public healthCheck(req: Request, res: Response): void {
        res.json({ 
            status: 'ok', 
            message: 'Twilio Voice Sales Agent is running',
            timestamp: new Date().toISOString()
        });
    }
}

export default new ConversationController();