import { z } from 'zod';
import { ROLES, COMPANY_STAGES, TEAM_SIZES, REGIONS, BUDGET_RANGES, USE_CASES } from './onboarding-constants';

export const UserProfileSchema = z.object({
  role:                 z.enum(ROLES),
  company_stage:        z.enum(COMPANY_STAGES),
  team_size:            z.enum(TEAM_SIZES),
  region:               z.enum(REGIONS),
  monthly_budget_range: z.enum(BUDGET_RANGES),
  primary_use_case:     z.enum(USE_CASES),
});

export type UserProfileInput = z.infer<typeof UserProfileSchema>;
