import { collections } from "./rxdb";
import { Chat } from "./types";

export async function getAllChats() {
  const result = await collections.chats
    .find({
      sort: [{ created_at: 'desc' }],
    })
    .exec();

  return result.map((doc) => doc.toJSON());
}

export async function upsertChat(chat: Chat) {
  const loaded = await collections.chats.findOne(chat.id).exec();
  if (!loaded) {
    const created = { ...chat, updated_at: Date.now() };
    const newObj = await collections.chats.insert(created);
    return newObj.toJSON();
  } else {
    const updated = { ...chat, updated_at: Date.now() };
    await loaded.patch(updated);
    return loaded.toJSON();
  }
}

export async function updateChatTitle(chatId: string, title: string) {
  const loaded = await collections.chats.findOne(chatId).exec();

  if (loaded) {
    const newObj = await loaded.patch({title});
    return newObj.toJSON();
  }
}

export async function updateChatModel(chatId: string, model: string) {
  const loaded = await collections.chats.findOne(chatId).exec();

  if (loaded) {
    const newObj = await loaded.patch({ model: model });
    return newObj.toJSON();
  }
}