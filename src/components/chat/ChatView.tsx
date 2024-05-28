import { useEffect, useRef } from 'react';
import { Chat, Message } from '../../lib/types';
import { getMessagesThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import MessageInput from './MessageInput';
import OtherMessage from './OtherMessage';
import UserMessage from './UserMessage';
import { generateTitleThunk, updateModelThunk } from '../../redux/slice/chatSlice';
import ModelSelect from '../ModelSelect';

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

export default function ChatView({ chat, isNewChat = false }: ChatViewProps) {
  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));
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
        model: chat.model,
      })
    );
  }, [chat.id]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }

  }, [chat.id])

  const handleModelChange = (value: string) => {
    dispatch(updateModelThunk({chatId: chat.id, model: value}));
  }

  return (
    <div className="flex flex-col w-full">
      <div className="px-6 bg-[#fff] h-14 flex items-center shrink-0 drag-region">
        <div className='no-drag-region'>
          <ModelSelect value={chat.model} onChange={handleModelChange} />
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className=" h-[calc(100vh-140px)] overflow-y-auto" ref={messagesRef}>
          <div className="pb-24 px-4 max-w-3xl mx-auto">
            {messages.map((message: Message) => {
              return message.role === 'user' ? (
                <UserMessage message={message} key={message.id} />
              ) : (
                <OtherMessage message={message} key={message.id} />
              );
            })}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center py-4">
        <MessageInput chatId={chat.id} model={chat.model} isNewChat={isNewChat} />
      </div>
    </div>
  );
}
