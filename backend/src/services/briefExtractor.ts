import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function extractIntake(conversation: string) {
  const prompt = `
Extract a structured campaign intake from this conversation.

Return valid JSON ONLY with keys:
- productDescription
- campaignGoal
- targetAudience
- budget
- primaryChannels
- tone

Conversation:
${conversation}
`;

  const r = await model.generateContent(prompt);
  const text = r.response.text();

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
