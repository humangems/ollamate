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
