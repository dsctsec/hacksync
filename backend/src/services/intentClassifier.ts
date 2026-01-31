import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export type Intent =
  | 'smalltalk'
  | 'capabilities'
  | 'strategy_preview'
  | 'start_campaign'
  | 'confirm_campaign'
  | 'other';

export async function classifyIntent(message: string): Promise<Intent> {
  const prompt = `
Classify the user's intent into ONE of:
- smalltalk
- capabilities
- strategy_preview
- start_campaign
- confirm_campaign
- other

Message:
"${message}"

Return ONLY the label.
`;

  const r = await model.generateContent(prompt);
  const text = r.response.text().trim().toLowerCase();

  if (text.includes('smalltalk')) return 'smalltalk';
  if (text.includes('capabilities')) return 'capabilities';
  if (text.includes('strategy_preview')) return 'strategy_preview';
  if (text.includes('confirm_campaign')) return 'confirm_campaign';
  if (text.includes('start_campaign')) return 'start_campaign';

  return 'other';
}
