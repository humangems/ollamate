import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatView from '../components/chat/ChatView';
import { chatSelectors } from '../redux/slice/chatSlice';
import { getMessagesThunk } from '../redux/slice/messageSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';

export default function ChatPage() {
  const { chatId } = useParams();
  const dispatch = useAppDispatch();

  const chat = useAppSelector((state) => chatSelectors.selectById(state.chats, chatId!));

  useEffect(() => {
    if (!chatId) return;
    dispatch(getMessagesThunk(chatId));
  }, [chatId, dispatch]);

  if (!chat) return null;

  return (
    <div className="h-full">
      <ChatView key={chatId} chat={chat} isNewChat={false} />
    </div>
  );
}
