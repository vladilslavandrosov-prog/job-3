import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { embedText } from '@/lib/rag/embeddings';
import { answerFromChunks } from '@/lib/rag/answer';

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

  const { question } = await request.json();
  if (!question) return NextResponse.json({ error: 'question is required' }, { status: 400 });

  const queryEmbedding = await embedText(question);

  const service = await createServiceClient();
  const { data: chunks, error } = await service.rpc('match_rag_chunks', {
    query_embedding: queryEmbedding,
    match_tenant_id: tenantUser.tenant_id,
    match_count: 5,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!chunks || chunks.length === 0) {
    return NextResponse.json({ answer: 'В загруженных документах не найдено релевантной информации.', sources: [] });
  }

  const answer = await answerFromChunks(question, chunks);

  return NextResponse.json({
    answer,
    sources: chunks.map((c: { document_id: string; similarity: number }) => ({
      document_id: c.document_id,
      similarity: c.similarity,
    })),
  });
}
