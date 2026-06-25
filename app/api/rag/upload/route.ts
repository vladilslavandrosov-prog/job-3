import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { chunkText } from '@/lib/rag/chunk';
import { embedTexts } from '@/lib/rag/embeddings';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();
  if (!tenantUser) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const { title, text } = await request.json();
  if (!title || !text) {
    return NextResponse.json({ error: 'title and text are required' }, { status: 400 });
  }

  const chunks = chunkText(text);
  const embeddings = await embedTexts(chunks);

  const service = await createServiceClient();

  const { data: document, error: docError } = await service
    .from('rag_documents')
    .insert({ tenant_id: tenantUser.tenant_id, uploaded_by: user.id, title })
    .select()
    .single();
  if (docError) return NextResponse.json({ error: docError.message }, { status: 500 });

  const rows = chunks.map((content, i) => ({
    document_id: document.id,
    tenant_id: tenantUser.tenant_id,
    chunk_index: i,
    content,
    embedding: embeddings[i],
  }));

  const { error: chunksError } = await service.from('rag_chunks').insert(rows);
  if (chunksError) return NextResponse.json({ error: chunksError.message }, { status: 500 });

  return NextResponse.json({ document_id: document.id, chunks: rows.length });
}
