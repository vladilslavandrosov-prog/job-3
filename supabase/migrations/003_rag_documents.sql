-- RAG agent: document storage with vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  source TEXT, -- original filename or URL
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX rag_chunks_embedding_idx ON rag_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX rag_chunks_tenant_idx ON rag_chunks (tenant_id);

ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant members can read their documents" ON rag_documents
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

CREATE POLICY "tenant members can read their chunks" ON rag_chunks
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
  );

-- Writes happen via the service role from API routes, so no INSERT/UPDATE/DELETE policies for regular users.

CREATE OR REPLACE FUNCTION match_rag_chunks(
  query_embedding vector(1536),
  match_tenant_id UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    rag_chunks.id,
    rag_chunks.document_id,
    rag_chunks.content,
    1 - (rag_chunks.embedding <=> query_embedding) AS similarity
  FROM rag_chunks
  WHERE rag_chunks.tenant_id = match_tenant_id
  ORDER BY rag_chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;
