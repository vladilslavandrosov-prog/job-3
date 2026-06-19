-- Fix infinite recursion in tenant_users RLS policy.
-- The previous policy queried tenant_users from within its own policy,
-- causing Postgres to recurse indefinitely when evaluating it.
DROP POLICY IF EXISTS "Users see own tenant_users" ON tenant_users;

CREATE POLICY "Users see own tenant_users" ON tenant_users
  FOR ALL USING (user_id = auth.uid());
