import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1200,
  },
});

/**
 * StrategistAIService
 * -------------------
 * Thin wrapper around Gemini.
 *
 * Responsibilities:
 * 1. Conversational previews (safe, non-committal)
 * 2. Raw prompt execution for StrategyService (explicit only)
 *
 * It does NOT:
 * - manage sessions
 * - infer intent
 * - orchestrate pipelines
 */
class StrategistAIService {
  /**
   * High-level strategy preview used in conversation mode.
   * Short, helpful, non-committal.
   */
  public async previewStrategy(userMessage: string): Promise<string> {
    const prompt = `
You are a senior brand strategist.

Give a HIGH-LEVEL strategic preview.
Do NOT generate a full campaign plan.
Do NOT include timelines, frameworks, or execution details.
Keep it concise and conversational.

User message:
"${userMessage}"
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  /**
   * Executes a raw prompt and returns the text output.
   * Used ONLY by StrategyService for full campaign generation.
   */
  public async runRawPrompt(prompt: string): Promise<any> {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    /**
     * We intentionally return raw text here.
     * Parsing / validation is handled by StrategyService.
     */
    return {
      contextSynthesis: this.extractSection(text, 'contextSynthesis'),
      strategicDiagnosis: this.extractSection(text, 'strategicDiagnosis'),
      campaignTheme: this.extractSection(text, 'campaignTheme'),
      channelActivation: this.extractSection(text, 'channelActivation'),
      timeline: this.extractSection(text, 'timeline'),
      raw: text,
    };
  }

  /**
   * Helper to extract a labeled section from the LLM output.
   * This makes the pipeline more robust to formatting noise.
   */
  private extractSection(text: string, key: string): string {
    const regex = new RegExp(`${key}\\s*[:\\-]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }
}

export default new StrategistAIService();
