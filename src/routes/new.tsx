import { nanoid } from '@reduxjs/toolkit';
import { useState } from 'react';
import ChatView from '../components/chat/ChatView';
import { useAppSelector } from '../redux/store';
import { selectDefaultModelForNewChat } from '../redux/slice/modelSlice';

export default function NewPage() {
  const [chatId] = useState(() => nanoid());
  const model = useAppSelector((state) => selectDefaultModelForNewChat(state));

  return (
    <div className="h-full">
      <ChatView chat={{ id: chatId, model: model }} isNewChat={true} />
    </div>
  );
}
