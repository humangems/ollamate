import { trpcClient } from './trpc';
import { Message } from './types';

export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  const result = await trpcClient.chat.chatMessages.query({ chatId });
  return result as Message[];
}

export async function addMessage(message: Message): Promise<Message> {
  const result = await trpcClient.chat.addMessage.mutate({
    id: message.id,
    chat_id: message.chat_id,
    role: message.role,
    content: message.content,
    model: message.model,
    images: message.images,
    eval_count: message.eval_count,
    created_at: message.created_at,
    updated_at: message.updated_at,
  });
  return result as Message;
}
