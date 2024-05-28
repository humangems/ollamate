import { useEffect } from 'react';
import { Chat, Message } from '../../lib/types';
import { getMessagesThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import MessageInput from './MessageInput';
import OtherMessage from './OtherMessage';
import UserMessage from './UserMessage';
import { generateTitleThunk } from '../../redux/slice/chatSlice';

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

export default function ChatView({ chat, isNewChat = false }: ChatViewProps) {
  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));
  const model = useAppSelector((state) => state.ui.selectedModel);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getMessagesThunk(chat.id));
  }, [chat.id]);

  useEffect(() => {
    if (chat.title) return;

    if (messages.length !== 2) return;

    dispatch(
      generateTitleThunk({
        chatId: chat.id,
        messages: messages.map((m) => {
          return {
            role: m.role,
            content: m.content,
          };
        }),
        model: 'llama3:latest',
      })
    );
  }, [chat.id]);

  return (
    <div>
      <div className="mt-4 pb-32">
        {messages.map((message: Message) => {
          return message.role === 'user' ? (
            <UserMessage message={message} key={message.id} />
          ) : (
            <OtherMessage message={message} key={message.id} />
          );
        })}
      </div>

      <MessageInput chatId={chat.id} model={model} isNewChat={isNewChat} />
    </div>
  );
}
