import { collections } from './rxdb';
import { Message } from './types';

function toStoredMessage(message: Message) {
  return {
    id: message.id,
    chat_id: message.chat_id,
    role: message.role,
    content: message.content,
    model: message.model,
    provider: message.provider,
    images: message.images,
  };
}

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
  const created = {
    ...toStoredMessage(message),
    created_at: Date.now(),
    updated_at: Date.now(),
  };
  const newObj = await collections.messages.insert(created);
  return newObj.toJSON();
}
