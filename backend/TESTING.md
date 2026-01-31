# Testing Guide

## Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Twilio Voice Sales Agent is running",
  "timestamp": "2026-01-14T..."
}
```

### 2. Make a Test Call
```bash
curl -X POST http://localhost:3000/api/make-call \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "callSid": "CA...",
  "to": "+1234567890"
}
```

## Testing Twilio Voice Webhook Locally

### Using ngrok:

1. Start your server:
```bash
npm run dev
```

2. In another terminal, start ngrok:
```bash
ngrok http 3000
```

3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

4. Go to [Twilio Console](https://console.twilio.com/)
   - Navigate to Phone Numbers > Manage > Active numbers
   - Click on your phone number
   - Under "Voice & Fax", set "A CALL COMES IN" webhook to:
     ```
     https://abc123.ngrok.io/api/webhook/voice
     ```
   - Select "HTTP POST"
   - Save

5. Call your Twilio number and test the conversation:
   - The bot will greet you with a welcome message
   - Try saying: "What products do you have?"
   - Try saying: "How much does it cost?"
   - Try saying: "I'd like a demo"
   - Try saying: "I want to speak to a representative"
   - Try saying: "No thank you, goodbye"

## Sample Conversation Flow

**Bot**: "Hello! Welcome to our sales team. I'm your virtual sales assistant. How can I help you today? You can ask about our products, pricing, or request a demo."

**Customer**: "What products do you sell?"

**Bot**: "We offer three main products: Our C R M tool for customer relationship management, an analytics platform for data insights, and automation software to streamline your workflows. Each solution is designed to help businesses grow and operate more efficiently. Which area interests you most?"

**Customer**: "How much does it cost?"

**Bot**: "Our products range from $99 for our basic package to $999 for our enterprise solution. We also offer custom pricing for larger organizations. Would you like me to connect you with a sales representative who can provide detailed pricing for your specific needs?"

**Customer**: "I'd like to try a demo"

**Bot**: "Excellent! I'd be happy to set up a free demo for you. I'll have one of our sales specialists reach out within 24 hours to schedule a personalized demonstration. You can also visit our website to book a time that works best for you. Is there a specific product you'd like to see?"

**Customer**: "No, that's all"

**Bot**: "Perfect! Thank you so much for calling. If you need anything in the future, don't hesitate to reach out. Have a wonderful day! Thank you for calling. Goodbye!"

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists with proper values

### Calls not connecting
- Verify Twilio credentials in `.env`
- Check Twilio account balance
- Verify phone numbers are in correct format (+1234567890)
- Ensure your Twilio number has voice capabilities enabled

### Webhook not receiving calls
- Ensure ngrok is running
- Verify webhook URL in Twilio console is correct (under Voice & Fax)
- Check ngrok terminal for incoming requests
- Look at server logs for errors
- Make sure the webhook is set to HTTP POST

### Speech recognition not working
- Speak clearly and at a normal pace
- Ensure there's minimal background noise
- The bot also accepts DTMF (keypad) input as a fallback
