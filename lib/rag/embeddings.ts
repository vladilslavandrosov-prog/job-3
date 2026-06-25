const EMBEDDING_MODEL = 'text-embedding-3-small';

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI embeddings request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}
