import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: tenantUser } = await supabase.from('tenant_users').select('tenant_id').eq('user_id', user.id).single();

  // Try Flask SSE proxy
  if (process.env.FLASK_BACKEND_URL) {
    try {
      const flaskStream = await fetch(`${process.env.FLASK_BACKEND_URL}/api/stream/${id}`, {
        headers: { 'X-Tenant-ID': tenantUser?.tenant_id ?? '' },
        signal: AbortSignal.timeout(60000),
      });
      if (flaskStream.ok && flaskStream.body) {
        return new Response(flaskStream.body, {
          headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' },
        });
      }
    } catch {}
  }

  // Mock SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const messages = [
        'data: {"type":"progress","text":"Анализирую требования..."}\n\n',
        'data: {"type":"section","key":"summary","text":"Разработка корпоративной ИС для управления процессами."}\n\n',
        'data: {"type":"section","key":"tech_stack","text":"React, Node.js, PostgreSQL, Docker"}\n\n',
        'data: {"type":"section","key":"team","text":"Команда 3-5 человек, опыт от 3 лет"}\n\n',
        'data: {"type":"section","key":"risks","text":"Сжатые сроки (3 месяца), требуется интеграция с ГИС"}\n\n',
        'data: {"type":"recommendation","value":"participate","reason":"Соответствует нашей экспертизе, бюджет достаточный"}\n\n',
        'event: done\ndata: {}\n\n',
      ];
      for (const msg of messages) {
        await new Promise(r => setTimeout(r, 700));
        controller.enqueue(encoder.encode(msg));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' },
  });
}
