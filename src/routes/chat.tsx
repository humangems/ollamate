import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatView from '../components/chat/ChatView';
import { chatSelectors } from '../redux/slice/chatSlice';
import { getMessagesThunk } from '../redux/slice/messageSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';

export default function ChatPage() {
  const { chatId } = useParams();
  const dispatch = useAppDispatch();
  const [loadedChatId, setLoadedChatId] = useState<string | null>(null);

  const chat = useAppSelector((state) => chatSelectors.selectById(state.chats, chatId!));

  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;
    dispatch(getMessagesThunk(chatId)).then(() => {
      if (!cancelled) setLoadedChatId(chatId);
    });
    return () => {
      cancelled = true;
    };
  }, [chatId, dispatch]);

  const messagesReady = loadedChatId === chatId;

  if (!chat || !messagesReady) return null;

  return (
    <div className="h-full">
      <ChatView key={chatId} chat={chat} isNewChat={false} />
    </div>
  );
}
