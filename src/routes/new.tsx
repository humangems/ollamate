import { nanoid } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatView from '../components/chat/ChatView';
import { useAppSelector } from '../redux/store';
import { selectDefaultModelForNewChat } from '../redux/slice/modelSlice';

export default function NewPage() {
  const [chatId] = useState(() => nanoid());

  const newChatId = useAppSelector((state) => state.chats.newChatId);
  const navigate = useNavigate();
  const model = useAppSelector((state) => selectDefaultModelForNewChat(state));

  useEffect(() => {
    if (newChatId && newChatId === chatId) {
      navigate(`/chat/${newChatId}`);
    }
  }, [chatId, navigate, newChatId]);

  return (
    <div className="h-full">
      <ChatView chat={{ id: chatId, model: model }} isNewChat={true} />
    </div>
  );
}
