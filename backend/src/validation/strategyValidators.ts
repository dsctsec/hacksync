export function tryParseJSON(text: string): { ok: boolean; value?: any; error?: string } {
  if (!text || typeof text !== 'string') return { ok: false, error: 'No text' };

  // Try to locate a JSON substring first
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let start = -1;
  if (firstBrace === -1 && firstBracket === -1) {
    // No obvious JSON
    try {
      return { ok: false, error: 'No JSON object detected' };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
  if (firstBrace === -1) start = firstBracket;
  else if (firstBracket === -1) start = firstBrace;
  else start = Math.min(firstBrace, firstBracket);

  // Try to extract from start to last matching brace/bracket
  const substr = text.slice(start);
  // Attempt direct parse first
  try {
    const parsed = JSON.parse(substr);
    return { ok: true, value: parsed };
  } catch (e) {
    // If direct parse fails, attempt to find balanced braces/brackets
    // Simple approach: find last closing brace/bracket
    const lastBrace = substr.lastIndexOf('}');
    const lastBracket = substr.lastIndexOf(']');
    const end = Math.max(lastBrace, lastBracket);
    if (end > 0) {
      const candidate = substr.slice(0, end + 1);
      try {
        const parsed = JSON.parse(candidate);
        return { ok: true, value: parsed };
      } catch (err) {
        return { ok: false, error: 'Failed to parse JSON candidate' };
      }
    }
    return { ok: false, error: 'Unable to parse JSON' };
  }
}

export function validateContextSynthesis(obj: any): boolean {
  if (!obj) return false;
  return typeof obj.brand_maturity === 'string' && typeof obj.funnel_health === 'string';
}

export function validateStrategicDiagnosis(obj: any): boolean {
  if (!obj) return false;
  return typeof obj.problem_statement === 'string' && typeof obj.strategic_objective === 'string';
}

export function validateCampaignTheme(obj: any): boolean {
  if (!obj) return false;
  return typeof obj.campaign_name === 'string' && typeof obj.core_idea === 'string' && Array.isArray(obj.pillars);
}

export function validateChannelActivation(obj: any): boolean {
  return Array.isArray(obj);
}

export function validateTimeline(obj: any): boolean {
  return Array.isArray(obj);
}
