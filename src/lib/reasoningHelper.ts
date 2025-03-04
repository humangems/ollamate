export function extractReasoning(content: string) {
  const thinkingRegex = /<think>\s*([\s\S]*?)(?:\s*<\/think>|$)/;
  const contentRegex = /<\/think>\s*([\s\S]*)/;
  const thinkingMatch = content.match(thinkingRegex);
  const contentMatch = content.match(contentRegex);

  const thinkingPart = thinkingMatch ? thinkingMatch[1] : '';
  let contentPart = content;
  if (thinkingMatch) {
    contentPart = contentMatch ? contentMatch[1] : '';
  }

  return [thinkingPart, contentPart];
}
