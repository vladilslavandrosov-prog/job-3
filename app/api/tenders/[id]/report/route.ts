import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: tenantUser } = await supabase.from('tenant_users').select('tenant_id').eq('user_id', user.id).single();

  if (process.env.FLASK_BACKEND_URL) {
    try {
      const res = await fetch(`${process.env.FLASK_BACKEND_URL}/api/report/${id}`, {
        headers: { 'X-Tenant-ID': tenantUser?.tenant_id ?? '' },
      });
      if (res.ok) {
        return new Response(res.body, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="tender-${id}.pdf"`,
          },
        });
      }
    } catch {}
  }

  return new Response('PDF not available (mock mode)', { status: 503 });
}
