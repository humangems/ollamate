import { Chat, Message } from '../../lib/types';
import { selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppSelector } from '../../redux/store';
import MessageInput from './MessageInput';
import OtherMessage from './OtherMessage';
import UserMessage from './UserMessage';

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

export default function ChatView({ chat, isNewChat=false }: ChatViewProps) {

  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));
  const model = useAppSelector((state) => state.ui.selectedModel);

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
