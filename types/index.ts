export type Plan = 'starter' | 'team' | 'corporate';

export interface Tenant {
  id: string;
  name: string;
  plan: Plan;
  subscription_expires_at: string | null;
  yukassa_customer_id: string | null;
  created_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export type Decision = 'interesting' | 'rejected' | 'deferred';

export interface Tender {
  id: string;
  title: string;
  zakazchik: string;
  amount: number;
  deadline: string;
  published_at: string;
  platform: string; // ЕИС | Росэлторг | СЭТП | ...
  status: string;
  tech_stack?: string[];
  description?: string;
  requirements?: string;
  decision?: Decision;
  is_new?: boolean;
  ai_analyzed?: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  tech_stack: string[];
  team_requirements: string;
  risks: string[];
  recommendation: 'participate' | 'decline';
  recommendation_reason: string;
}

export interface Subscription {
  plan: Plan;
  expires_at: string | null;
  ai_analyses_used: number;
  ai_analyses_limit: number | null;
}

export interface Payment {
  id: string;
  tenant_id: string;
  yukassa_payment_id: string;
  amount: number;
  plan: Plan;
  status: 'pending' | 'succeeded' | 'canceled';
  created_at: string;
}

export interface TelegramUser {
  id: string;
  tenant_id: string;
  user_id: string;
  telegram_id: number;
  filters: Record<string, unknown>;
  paused_until: string | null;
  created_at: string;
}
