import { trpcClient } from './trpc';
import { Chat } from './types';

export async function getAllChats(): Promise<Chat[]> {
  const result = await trpcClient.chat.chatList.query();
  return result as Chat[];
}

export async function upsertChat(chat: Chat): Promise<Chat> {
  const result = await trpcClient.chat.createChat.mutate({
    id: chat.id,
    model: chat.model,
    title: chat.title,
    created_at: chat.created_at,
  });
  return result as Chat;
}

export async function updateChatTitle(chatId: string, title: string): Promise<Chat> {
  const result = await trpcClient.chat.updateChat.mutate({ id: chatId, title });
  return result as Chat;
}

export async function updateChatModel(chatId: string, model: string): Promise<Chat> {
  const result = await trpcClient.chat.updateChat.mutate({ id: chatId, model });
  return result as Chat;
}

export async function deleteChat(chatId: string): Promise<void> {
  await trpcClient.chat.deleteChat.mutate({ id: chatId });
}
