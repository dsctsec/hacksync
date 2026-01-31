import sessionStore from './sessionStore';
import strategistAIService from './strategistAIService';
import { classifyIntent } from './intentClassifier';
import { extractIntake } from './briefExtractor';

function lastAssistantAskedToProceed(messages: { role: string; content: string }[]) {
  const last = [...messages].reverse().find(m => m.role === 'assistant');
  if (!last) return false;

  const text = last.content.toLowerCase();
  return (
    text.includes('turn this into a structured campaign') ||
    text.includes('structured campaign plan') ||
    text.includes('proceed with this') ||
    text.includes('want me to')
  );
}

function isPositiveContinuation(message: string) {
  const m = message.toLowerCase().trim();
  return (
    m === 'yes' ||
    m === 'yeah' ||
    m === 'yep' ||
    m === 'go ahead' ||
    m === 'do it' ||
    m === 'proceed' ||
    m.includes('make it') ||
    m.includes('detailed') ||
    m.includes('sounds good')
  );
}

class NestGptService {
  async handleMessage(sessionId: string | undefined, message: string) {
    const session = sessionStore.getOrCreate(sessionId);
    session.messages.push({ role: 'user', content: message });

    let reply = '';

    // ---------- CONVERSATION MODE ----------
    if (session.mode === 'conversation') {
      const intent = await classifyIntent(message);

      // 🧠 SMART CONFIRMATION (this is the missing piece)
      if (
        lastAssistantAskedToProceed(session.messages) &&
        isPositiveContinuation(message)
      ) {
        const conversationText = session.messages
          .map(m => `${m.role}: ${m.content}`)
          .join('\n');

        const intake = await extractIntake(conversationText);

        if (!intake) {
          reply =
            'I’m almost there — could you briefly restate your brand and campaign goal so I can structure it correctly?';
        } else {
          session.mode = 'campaign';
          session.extractedIntake = intake;

          reply =
            `Great. Here’s what I understood from our conversation:\n\n` +
            JSON.stringify(intake, null, 2) +
            `\n\nShall I proceed with building the full campaign plan using this?`;
        }

        session.messages.push({ role: 'assistant', content: reply });
        sessionStore.save(session);
        return { reply, sessionId: session.id };
      }

      // ---- Normal conversation handling ----
      if (intent === 'smalltalk') {
        reply = 'Hi! How can I help you today? 😊';
      } else if (intent === 'capabilities') {
        reply = `
I can help you with:
• Social media strategy
• Campaign planning
• Content ideas
• Brand positioning

When you're ready, just describe your brand or campaign idea and I’ll guide you.
`.trim();
      } else if (intent === 'strategy_preview') {
        const preview = await strategistAIService.previewStrategy(message);
        reply =
          preview +
          '\n\nIf you want, I can turn this into a structured campaign plan.';
      } else {
        reply = await strategistAIService.previewStrategy(message);
      }
    }

    // ---------- CAMPAIGN MODE ----------
    else {
      reply =
        'Perfect. I’ll now build the campaign step by step.\n\nWould you like me to start with context & diagnosis, or jump straight into the campaign theme?';
    }

    session.messages.push({ role: 'assistant', content: reply });
    sessionStore.save(session);

    return { reply, sessionId: session.id };
  }
}

export default new NestGptService();
