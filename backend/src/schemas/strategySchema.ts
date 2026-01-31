export type Intake = {
  campaignGoal: string;
  productDescription: string;
  oneLiner?: string;
  audience?: any;
  startDate?: string;
  durationWeeks?: number;
  budget?: string | number;
  primaryChannels?: string[];
  tone?: string;
};

export function validateIntake(obj: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!obj) {
    errors.push('intake is required');
    return { valid: false, errors };
  }
  if (!obj.campaignGoal || typeof obj.campaignGoal !== 'string') {
    errors.push('campaignGoal is required and must be a string');
  }
  if (!obj.productDescription || typeof obj.productDescription !== 'string') {
    errors.push('productDescription is required and must be a string');
  }
  if (obj.startDate && isNaN(Date.parse(obj.startDate))) {
    errors.push('startDate must be a valid ISO date string');
  }
  if (obj.durationWeeks && typeof obj.durationWeeks !== 'number') {
    errors.push('durationWeeks must be a number');
  }
  if (obj.primaryChannels && !Array.isArray(obj.primaryChannels)) {
    errors.push('primaryChannels must be an array of strings');
  }

  return { valid: errors.length === 0, errors };
}
