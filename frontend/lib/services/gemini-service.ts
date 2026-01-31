import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables."
    );
  }
  
  return new GoogleGenerativeAI(apiKey);
};

export interface ToneOption {
  value: string;
  label: string;
}

export interface PostingTime {
  day: string;
  time: string;
  engagement: string;
  reason?: string;
}

export interface AdRecommendation {
  title: string;
  rationale: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  private getClient() {
    if (!this.genAI) {
      this.genAI = getGeminiClient();
    }
    return this.genAI;
  }

  /**
   * Improve a caption for better engagement
   */
  async improveCaption(caption: string, platform?: string): Promise<string> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const platformContext = platform ? ` for ${platform}` : "";
      const prompt = `You are a social media copywriting expert. Improve the following caption${platformContext} to make it more engaging, compelling, and likely to drive interaction. Keep the core message but enhance clarity, add emotional appeal, and optimize for engagement. Keep it concise and natural.

Original caption: "${caption}"

Provide only the improved caption without any explanations or quotation marks.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const improvedText = response.text().trim();
      
      return improvedText || caption;
    } catch (error: any) {
      console.error("Error improving caption:", error);
      throw new Error(
        error.message || "Failed to improve caption. Please try again."
      );
    }
  }

  /**
   * Adjust caption tone to match specified style
   */
  async adjustTone(
    caption: string,
    tone: string,
    platform?: string
  ): Promise<string> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const platformContext = platform ? ` for ${platform}` : "";
      const prompt = `You are a social media copywriting expert. Rewrite the following caption${platformContext} in a ${tone} tone while maintaining the core message and key information.

Tone: ${tone}
Original caption: "${caption}"

Guidelines for ${tone} tone:
${this.getToneGuidelines(tone)}

Provide only the rewritten caption without any explanations or quotation marks.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const adjustedText = response.text().trim();
      
      return adjustedText || caption;
    } catch (error: any) {
      console.error("Error adjusting tone:", error);
      throw new Error(
        error.message || "Failed to adjust tone. Please try again."
      );
    }
  }

  /**
   * Generate relevant hashtags based on caption content
   */
  async generateHashtags(
    caption: string,
    platform?: string,
    count: number = 10
  ): Promise<string[]> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const platformContext = platform ? ` for ${platform}` : "";
      const prompt = `You are a social media hashtag expert. Generate ${count} relevant, trending, and effective hashtags${platformContext} based on the following caption content.

Caption: "${caption}"

Requirements:
- Hashtags should be relevant to the content
- Mix of popular and niche hashtags
- Appropriate for the platform
- Include industry-specific tags
- Format: #hashtag (one per line)

Provide only the hashtags, one per line, without numbering or explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const hashtagText = response.text().trim();
      
      // Parse hashtags from response
      const hashtags = hashtagText
        .split("\n")
        .map((tag) => tag.trim())
        .filter((tag) => tag.startsWith("#"))
        .slice(0, count);
      
      // Fallback to generic hashtags if none generated
      if (hashtags.length === 0) {
        return [
          "#socialmedia",
          "#marketing",
          "#digitalmarketing",
          "#contentcreator",
          "#business",
        ];
      }
      
      return hashtags;
    } catch (error: any) {
      console.error("Error generating hashtags:", error);
      throw new Error(
        error.message || "Failed to generate hashtags. Please try again."
      );
    }
  }

  /**
   * Suggest optimal posting times based on content and platform
   */
  async suggestPostingTimes(
    caption: string,
    platform?: string
  ): Promise<PostingTime[]> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const platformContext = platform ? ` for ${platform}` : "";
      const prompt = `You are a social media analytics expert. Based on the following content${platformContext}, suggest 4 optimal posting times throughout the week.

Content: "${caption}"

Consider:
- Target audience activity patterns
- Content type and urgency
- Platform-specific best practices
- Day of week and time of day

Format your response as JSON array with this structure:
[
  {
    "day": "Monday",
    "time": "9:00 AM",
    "engagement": "High",
    "reason": "Brief explanation"
  }
]

Provide only the JSON array without any markdown formatting or explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();
      
      // Remove markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      try {
        const times = JSON.parse(responseText);
        if (Array.isArray(times) && times.length > 0) {
          return times.slice(0, 4);
        }
      } catch (parseError) {
        console.error("Error parsing posting times:", parseError);
      }
      
      // Fallback to default times
      return [
        { day: "Monday", time: "9:00 AM", engagement: "High" },
        { day: "Wednesday", time: "12:00 PM", engagement: "Very High" },
        { day: "Friday", time: "2:00 PM", engagement: "High" },
        { day: "Saturday", time: "10:00 AM", engagement: "Medium" },
      ];
    } catch (error: any) {
      console.error("Error suggesting posting times:", error);
      // Return default times on error
      return [
        { day: "Monday", time: "9:00 AM", engagement: "High" },
        { day: "Wednesday", time: "12:00 PM", engagement: "Very High" },
        { day: "Friday", time: "2:00 PM", engagement: "High" },
        { day: "Saturday", time: "10:00 AM", engagement: "Medium" },
      ];
    }
  }

  /**
   * Generate ad performance recommendations based on summary data
   */
  async generateAdRecommendations(
    summary: string,
    platform?: string
  ): Promise<AdRecommendation[]> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const platformContext = platform ? ` for ${platform}` : " across all platforms";
      const prompt = `You are a paid media strategist. Provide 4 concise, actionable recommendations${platformContext}.

Summary data:
${summary}

Return ONLY valid JSON array with this structure:
[
  { "title": "Short recommendation", "rationale": "1 sentence rationale" }
]

Keep each title under 8 words and each rationale under 20 words.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();

      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

      try {
        const recommendations = JSON.parse(responseText);
        if (Array.isArray(recommendations) && recommendations.length > 0) {
          return recommendations.slice(0, 4);
        }
      } catch (parseError) {
        console.error("Error parsing ad recommendations:", parseError);
      }

      return [
        { title: "Refine targeting", rationale: "Narrow audience segments to reduce wasted spend." },
        { title: "Refresh creatives", rationale: "Rotate assets to prevent fatigue and lift CTR." },
        { title: "Shift budget", rationale: "Reallocate spend toward highest-converting ads." },
        { title: "Optimize bids", rationale: "Adjust bids to improve CPA efficiency." },
      ];
    } catch (error: any) {
      console.error("Error generating ad recommendations:", error);
      throw new Error(
        error.message || "Failed to generate recommendations. Please try again."
      );
    }
  }

  /**
   * Get tone-specific guidelines for the AI
   */
  private getToneGuidelines(tone: string): string {
    const guidelines: Record<string, string> = {
      professional:
        "Use formal language, industry terminology, and maintain a polished, authoritative voice. Avoid slang and casual expressions.",
      casual:
        "Use conversational language, contractions, and a friendly approachable voice. Feel free to use emojis and casual expressions.",
      witty:
        "Use clever wordplay, humor, and creative expressions. Be entertaining while staying relevant to the message.",
      inspirational:
        "Use motivational language, positive affirmations, and uplifting expressions. Inspire action and emotional connection.",
      urgent:
        "Use action-oriented language, create sense of immediacy, and emphasize time-sensitivity. Include clear calls-to-action.",
    };

    return (
      guidelines[tone.toLowerCase()] ||
      "Maintain the original tone while improving clarity and engagement."
    );
  }
}

// Export singleton instance
const geminiService = new GeminiService();
export default geminiService;
