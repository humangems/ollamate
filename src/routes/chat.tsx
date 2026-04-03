import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatView from '../components/chat/ChatView';
import { chatSelectors } from '../redux/slice/chatSlice';
import { getMessagesThunk } from '../redux/slice/messageSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';

export default function ChatPage() {
  const { chatId } = useParams();
  const dispatch = useAppDispatch();
  const [messagesReady, setMessagesReady] = useState(false);

  const chat = useAppSelector((state) => chatSelectors.selectById(state.chats, chatId!));

  useEffect(() => {
    if (!chatId) return;
    setMessagesReady(false);
    dispatch(getMessagesThunk(chatId)).then(() => setMessagesReady(true));
  }, [chatId, dispatch]);

  if (!chat || !messagesReady) return null;

  return (
    <div className="h-full">
      <ChatView key={chatId} chat={chat} isNewChat={false} />
    </div>
  );
}
