export function toMarkdownFromLabeledText(text) {
  if (!text || typeof text !== 'string') return '';

  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd());

  const out = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const existingBulletMatch = line.match(/^[\-\*\u2022]\s+(.*)$/);
    if (existingBulletMatch) {
      out.push(`- ${existingBulletMatch[1].trim()}`);
      continue;
    }

    const labelMatch = line.match(/^([A-Za-z][A-Za-z0-9/&()' -]{2,}):\s*(.*)$/);
    if (labelMatch) {
      const label = labelMatch[1].trim();
      const value = labelMatch[2].trim();
      out.push(value ? `- **${label}:** ${value}` : `- **${label}:**`);
      continue;
    }

    out.push(`- ${line}`);
  }

  return out.join('\n').trim();
}
