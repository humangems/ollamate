import { type ModelMessage, type UserContent } from 'ai';

export const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.';

type ChatHistoryMessage = {
  role: string;
  content: string;
  images?: string[];
};

function toUserContent(message: ChatHistoryMessage): UserContent {
  if (!message.images?.length) {
    return message.content;
  }

  const parts: Exclude<UserContent, string> = [];

  if (message.content) {
    parts.push({
      type: 'text',
      text: message.content,
    });
  }

  for (const image of message.images) {
    parts.push({
      type: 'image',
      image,
      mediaType: 'image/jpeg',
    });
  }

  return parts;
}

export function toModelMessage(message: ChatHistoryMessage): ModelMessage {
  if (message.role === 'assistant') {
    return {
      role: 'assistant',
      content: message.content,
    };
  }

  if (message.role === 'system') {
    return {
      role: 'system',
      content: message.content,
    };
  }

  return {
    role: 'user',
    content: toUserContent(message),
  };
}

export function toModelMessages(messages: ChatHistoryMessage[]): ModelMessage[] {
  return messages.map(toModelMessage);
}
