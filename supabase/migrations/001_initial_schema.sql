-- Tenants (client companies)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter', -- starter | team | corporate
  subscription_expires_at TIMESTAMPTZ,
  yukassa_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User <-> Tenant mapping
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner | admin | member
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Telegram users
CREATE TABLE telegram_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  telegram_id BIGINT UNIQUE NOT NULL,
  filters JSONB DEFAULT '{}',
  paused_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved tenders (tenders live in Flask DB)
CREATE TABLE saved_tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tender_id TEXT NOT NULL,
  decision TEXT, -- interesting | rejected | deferred
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, tender_id)
);

-- Payment history
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  yukassa_payment_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in kopecks
  plan TEXT NOT NULL,
  status TEXT NOT NULL, -- pending | succeeded | canceled
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tenant" ON tenants
  FOR ALL USING (
    id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users see own tenant_users" ON tenant_users
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users see own telegram_users" ON telegram_users
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users see own saved_tenders" ON saved_tenders
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users see own payments" ON payments
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));
