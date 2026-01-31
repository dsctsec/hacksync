const StrategyPrompts = {
  contextSynthesis:
    `You are a marketing strategist assistant. Given the user intake and available metrics, produce a JSON object with fields: brand_maturity (early|growth|mature), funnel_health (awareness|engagement|conversion|balanced), constraints (array of strings), insight_summary (array of 1-3 short bullets). Return ONLY valid JSON.`,

  strategicDiagnosis:
    `Use the context synthesis output. Produce a JSON object with: problem_statement (one paragraph), strategic_objective (one-line), key_risks (array of {risk,severity}). Return ONLY valid JSON.`,

  campaignTheme:
    `Given intake and diagnosis, produce JSON: campaign_name, core_idea (1-2 lines), pillars (array of 3 {title,description}), tone. Return ONLY valid JSON.`,

  channelActivation:
    `For each channel in primaryChannels (or sensible defaults), produce an array of channel objects: {channel,why,role,content_types (array),sample_posts (array of strings),kpis}. Return ONLY valid JSON.`,

  timelineSequencing:
    `Given channels and durationWeeks, produce timeline array where each item is {week,activities:[{channel,activity,reason,deliverables}]}. Also return assumptions array. Return ONLY valid JSON.`,
};

export default StrategyPrompts;
