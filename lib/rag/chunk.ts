export function chunkText(text: string, maxChars = 1500, overlap = 200): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (normalized.length <= maxChars) return [normalized];

  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + maxChars, normalized.length);
    chunks.push(normalized.slice(start, end).trim());
    if (end === normalized.length) break;
    start = end - overlap;
  }
  return chunks.filter(Boolean);
}
