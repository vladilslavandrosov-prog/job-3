export type Plan = 'starter' | 'team' | 'corporate';
export type Feature =
  | 'AI_ANALYSIS'
  | 'TEAM_MANAGEMENT'
  | 'CRM_INTEGRATION'
  | 'EXCEL_EXPORT'
  | 'API_ACCESS'
  | 'UNLIMITED_HISTORY';

const gates: Record<Feature, Plan[]> = {
  AI_ANALYSIS:       ['starter', 'team', 'corporate'],
  TEAM_MANAGEMENT:   ['team', 'corporate'],
  CRM_INTEGRATION:   ['team', 'corporate'],
  EXCEL_EXPORT:      ['team', 'corporate'],
  API_ACCESS:        ['corporate'],
  UNLIMITED_HISTORY: ['corporate'],
};

export function canUseFeature(plan: Plan, feature: Feature): boolean {
  return gates[feature].includes(plan);
}

export const AI_ANALYSIS_LIMITS: Record<Plan, number | null> = {
  starter:   30,
  team:      150,
  corporate: null, // unlimited
};
