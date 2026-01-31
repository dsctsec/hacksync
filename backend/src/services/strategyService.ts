import CampaignModel from '../models/campaignModel';
import mongoose from 'mongoose';
import {
  tryParseJSON,
  validateCampaignTheme,
  validateChannelActivation,
  validateContextSynthesis,
  validateStrategicDiagnosis,
  validateTimeline,
} from '../validation/strategyValidators';
import strategistAIService from './strategistAIService';

/**
 * StrategyService
 * ----------------
 * This service is the ONLY place where a full campaign plan is generated.
 * It is called explicitly (never from casual chat).
 */

type Intake = any;
type Metrics = any;

class StrategyService {
  public async generateStrategy(intake: Intake, metrics: Metrics = {}): Promise<any> {
    /**
     * IMPORTANT:
     * We explicitly ask the LLM to generate ALL stages here.
     * This is a deliberate, user-confirmed action.
     */

    const raw = await this.runFullLLMPipeline(intake, metrics);

    const validationErrors: string[] = [];

    // ---------- Context ----------
    const ctxParse = tryParseJSON(raw.contextSynthesis || '');
    const context =
      ctxParse.ok && validateContextSynthesis(ctxParse.value)
        ? ctxParse.value
        : raw.contextSynthesis;
    if (!ctxParse.ok || typeof context === 'string') validationErrors.push('contextSynthesis');

    // ---------- Diagnosis ----------
    const diagParse = tryParseJSON(raw.strategicDiagnosis || '');
    const diagnosis =
      diagParse.ok && validateStrategicDiagnosis(diagParse.value)
        ? diagParse.value
        : raw.strategicDiagnosis;
    if (!diagParse.ok || typeof diagnosis === 'string') validationErrors.push('strategicDiagnosis');

    // ---------- Theme ----------
    const themeParse = tryParseJSON(raw.campaignTheme || '');
    const theme =
      themeParse.ok && validateCampaignTheme(themeParse.value)
        ? themeParse.value
        : raw.campaignTheme;
    if (!themeParse.ok || typeof theme === 'string') validationErrors.push('campaignTheme');

    // ---------- Channels ----------
    const chanParse = tryParseJSON(raw.channelActivation || '');
    const channels =
      chanParse.ok && validateChannelActivation(chanParse.value)
        ? chanParse.value
        : raw.channelActivation;
    if (!chanParse.ok || !Array.isArray(channels)) validationErrors.push('channelActivation');

    // ---------- Timeline ----------
    const tlParse = tryParseJSON(raw.timeline || '');
    const timeline =
      tlParse.ok && validateTimeline(tlParse.value)
        ? tlParse.value
        : raw.timeline;
    if (!tlParse.ok || !Array.isArray(timeline)) validationErrors.push('timeline');

    const plan: any = {
      contextSynthesis: context,
      strategicDiagnosis: diagnosis,
      campaignTheme: theme,
      channels,
      timeline,
      assets: [],
      kpis: [],
      assumptions: [],
      confidenceScore: validationErrors.length > 0 ? 0.5 : 0.8,
      validationErrors,
    };

    // ---------- Persistence (non-blocking) ----------
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return { campaignId: null, plan };
    }

    try {
      const doc: any = await CampaignModel.create({
        intake,
        metrics,
        plan,
        versions: [],
      });
      return { campaignId: doc._id.toString(), plan };
    } catch (err) {
      console.error('Campaign persistence failed:', err);
      return { campaignId: null, plan };
    }
  }

  /**
   * Runs the FULL LLM pipeline in one go.
   * This is intentionally centralized and explicit.
   */
  private async runFullLLMPipeline(intake: Intake, metrics: Metrics) {
    const prompt = `
You are a senior brand strategist.

Using the intake and metrics below, generate:
1. contextSynthesis (JSON)
2. strategicDiagnosis (JSON)
3. campaignTheme (JSON)
4. channelActivation (JSON array)
5. timeline (JSON array)

INTAKE:
${JSON.stringify(intake, null, 2)}

METRICS:
${JSON.stringify(metrics, null, 2)}

Return all sections clearly labeled.
`;

    const response = await strategistAIService.runRawPrompt(prompt);
    return response;
  }
}

export default new StrategyService();
