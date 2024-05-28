import { useEffect, useRef } from 'react';
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
  const messagesRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }

  }, [chat.id])


  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    console.log(e.currentTarget.scrollTop);
  }

  return (
    <div
      className="h-[calc(100vh-72px)] overflow-y-auto relative"
      ref={messagesRef}
    >
      <div className="pb-32 px-4 max-w-3xl mx-auto">
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
