import { GoogleGenerativeAI } from '@google/generative-ai';

class AntiCampaignService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  /**
   * Analyze a campaign and generate critical feedback
   */
  async analyzeCampaign(plan: string, campaignInfo?: {
    brandName?: string;
    industry?: string;
    targetAudience?: string;
    channels?: string[];
  }): Promise<{
    cliches: string[];
    competitorSimilarities: string[];
    potentialBackfires: Array<{
      scenario: string;
      likelihood: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
    criticalFeedback: string;
    recommendations: string[];
  }> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 3000,
      },
    });

    const prompt = `You are a contrarian marketing strategist known for brutally honest campaign critiques. Your job is to tear apart marketing strategies, find weaknesses, and force teams to think harder.

## Campaign to Analyze:
${plan}

${campaignInfo?.brandName ? `**Brand:** ${campaignInfo.brandName}` : ''}
${campaignInfo?.industry ? `**Industry:** ${campaignInfo.industry}` : ''}
${campaignInfo?.targetAudience ? `**Target Audience:** ${campaignInfo.targetAudience}` : ''}
${campaignInfo?.channels ? `**Channels:** ${campaignInfo.channels.join(', ')}` : ''}

---

## Your Task:

Critically analyze this campaign and provide a concise critique in the following JSON format:

{
  "cliches": ["List of marketing clichés found in the campaign"],
  "competitorSimilarities": ["Ways this campaign is similar to competitors"],
  "potentialBackfires": [
    {
      "scenario": "Specific scenario of what could go wrong",
      "likelihood": "low|medium|high",
      "impact": "low|medium|high",
      "mitigation": "How to prevent or handle this"
    }
  ],
  "criticalFeedback": "A concise critical analysis (2-3 sentences) pointing out key flaws and assumptions. Be candid but constructive.",
  "recommendations": ["Actionable recommendations to improve the campaign"]
}

## Guidelines:
- Be candid but constructive
- Limit lists to 2-3 items each
- Keep potential backfires to 1-2 scenarios
- Focus on the highest-impact weaknesses
- Keep mitigation strategies short and actionable
- Avoid piling on; prioritize clarity over volume

Return ONLY valid JSON, no markdown formatting, no code blocks.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean the response to extract JSON
      let jsonText = responseText.trim();
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const analysis = JSON.parse(jsonText);
      
      return {
        cliches: analysis.cliches || [],
        competitorSimilarities: analysis.competitorSimilarities || [],
        potentialBackfires: analysis.potentialBackfires || [],
        criticalFeedback: analysis.criticalFeedback || 'No critical feedback generated.',
        recommendations: analysis.recommendations || [],
      };
    } catch (error) {
      console.error('Error analyzing campaign:', error);
      // Return a fallback analysis
      return {
        cliches: ['Unable to analyze clichés'],
        competitorSimilarities: ['Unable to analyze competitor similarities'],
        potentialBackfires: [{
          scenario: 'Analysis failed',
          likelihood: 'medium',
          impact: 'low',
          mitigation: 'Please try again or provide more campaign details',
        }],
        criticalFeedback: 'Failed to generate critical analysis. Please ensure the campaign plan is detailed enough.',
        recommendations: ['Provide more campaign details for better analysis'],
      };
    }
  }
}

export default new AntiCampaignService();

