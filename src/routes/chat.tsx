import { useParams } from 'react-router-dom';
import ChatView from '../components/chat/ChatView';
import { useAppSelector } from '../redux/store';
import { chatSelectors } from '../redux/slice/chatSlice';

export default function ChatPage() {
  const { chatId } = useParams();

  const chat = useAppSelector((state) => chatSelectors.selectById(state.chats, chatId!));

  if (!chat) return null;

  return (
    <div className="h-full">
      <ChatView chat={chat} isNewChat={false} />
    </div>
  );
}
