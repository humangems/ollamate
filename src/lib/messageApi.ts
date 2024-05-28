import { collections } from "./rxdb";
import { Message } from "./types";

export async function getMessagesByChatId(chatId: string) { //TODO
  const result = await collections.messages
    .find({
      selector: {
        chat_id: chatId
      },
      sort: [{ created_at: 'desc' }],
    })
    .exec();

  return result.map((doc) => doc.toJSON());
}

export async function addMessage(message: Message) {
  const created = { ...message, created_at: Date.now(), updated_at: Date.now() };
  const newObj = await collections.messages.insert(created);
  return newObj.toJSON();
}
