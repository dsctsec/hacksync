import twilio from 'twilio';
import twilioConfig from '../config/twilio';

interface VoiceResponse {
    message: string;
    endCall: boolean;
}

export class TwilioService {
    private client: twilio.Twilio;

    constructor() {
        this.client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    }

    public async makeConversationalCall(to: string): Promise<any> {
        try {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
            
            const call = await this.client.calls.create({
                url: `${baseUrl}/api/webhook/conversational`,
                to,
                from: twilioConfig.phoneNumber,
            });
            console.log(`Conversational AI call initiated to ${to}, CallSid: ${call.sid}`);
            return call;
        } catch (error) {
            console.error('Error making conversational call:', error);
            throw error;
        }
    }

    public async makeSalesPitchCall(to: string): Promise<any> {
        try {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const call = await this.client.calls.create({
                url: `${baseUrl}/api/webhook/sales-pitch`,
                to,
                from: twilioConfig.phoneNumber,
            });
            console.log(`Sales pitch call initiated to ${to}, CallSid: ${call.sid}`);
            return call;
        } catch (error) {
            console.error('Error making sales pitch call:', error);
            throw error;
        }
    }

    public async makeCall(to: string, customMessage?: string): Promise<any> {
        try {
            const call = await this.client.calls.create({
                url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/webhook/voice`,
                to,
                from: twilioConfig.phoneNumber,
            });
            console.log(`Call initiated to ${to}, CallSid: ${call.sid}`);
            return call;
        } catch (error) {
            console.error('Error making call:', error);
            throw error;
        }
    }

    public processVoiceInput(input: string): VoiceResponse {
        // Normalize the input
        const normalizedInput = input.toLowerCase().trim();
        
        // Greeting intent
        if (normalizedInput.includes('hello') || normalizedInput.includes('hi')) {
            return {
                message: "Hello! It's great to hear from you. I can help you with information about our products, pricing, or schedule a demo. What would you like to know?",
                endCall: false
            };
        }
        
        // Pricing intent
        if (normalizedInput.includes('price') || normalizedInput.includes('cost') || normalizedInput.includes('how much')) {
            return {
                message: "Our products range from $99 for our basic package to $999 for our enterprise solution. We also offer custom pricing for larger organizations. Would you like me to connect you with a sales representative who can provide detailed pricing for your specific needs?",
                endCall: false
            };
        }
        
        // Product information intent
        if (normalizedInput.includes('product') || normalizedInput.includes('what do you sell') || normalizedInput.includes('tell me about')) {
            return {
                message: "We offer three main products: Our C R M tool for customer relationship management, an analytics platform for data insights, and automation software to streamline your workflows. Each solution is designed to help businesses grow and operate more efficiently. Which area interests you most?",
                endCall: false
            };
        }
        
        // Demo/Trial intent
        if (normalizedInput.includes('demo') || normalizedInput.includes('trial') || normalizedInput.includes('try')) {
            return {
                message: "Excellent! I'd be happy to set up a free demo for you. I'll have one of our sales specialists reach out within 24 hours to schedule a personalized demonstration. You can also visit our website to book a time that works best for you. Is there a specific product you'd like to see?",
                endCall: false
            };
        }
        
        // Purchase intent
        if (normalizedInput.includes('buy') || normalizedInput.includes('purchase') || normalizedInput.includes('sign up')) {
            return {
                message: "Wonderful! To get you started, I'll connect you with our sales team who can walk you through the purchase process and answer any questions. They'll also ensure you get the best package for your needs. Should I have someone call you back?",
                endCall: false
            };
        }
        
        // Representative/human request
        if (normalizedInput.includes('speak to') || normalizedInput.includes('representative') || normalizedInput.includes('human') || normalizedInput.includes('person')) {
            return {
                message: "Of course! I'll transfer you to one of our sales representatives right away. Please hold while I connect you.",
                endCall: false
            };
        }
        
        // Ending conversation
        if (normalizedInput.includes('no') || normalizedInput.includes('nothing') || normalizedInput.includes('that\'s all') || normalizedInput.includes('goodbye') || normalizedInput.includes('bye')) {
            return {
                message: "Perfect! Thank you so much for calling. If you need anything in the future, don't hesitate to reach out. Have a wonderful day!",
                endCall: true
            };
        }
        
        // Thanks
        if (normalizedInput.includes('thank')) {
            return {
                message: "You're very welcome! I'm here to help.",
                endCall: false
            };
        }
        
        // Default fallback
        return {
            message: "I understand you're interested in learning more. Could you please specify if you'd like information about our products, pricing, or if you'd like to schedule a demo? I'm here to help!",
            endCall: false
        };
    }
}

export default new TwilioService();