import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface RetrievedChunk {
  content: string;
  similarity: number;
}

export async function answerFromChunks(question: string, chunks: RetrievedChunk[]): Promise<string> {
  const context = chunks
    .map((chunk, i) => `[Источник ${i + 1}]\n${chunk.content}`)
    .join('\n\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system:
      'Ты отвечаешь на вопросы пользователя, используя только предоставленные источники. ' +
      'Если ответа нет в источниках, скажи об этом честно. Указывай номер источника при цитировании.',
    messages: [
      {
        role: 'user',
        content: `Источники:\n\n${context}\n\nВопрос: ${question}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}
