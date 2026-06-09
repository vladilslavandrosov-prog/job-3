-- Auto-create tenant when a new user registers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  INSERT INTO public.tenants (name, plan)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', 'Моя компания'), 'starter')
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.tenant_users (tenant_id, user_id, role)
  VALUES (new_tenant_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
