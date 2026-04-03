import { useState } from 'react';
import { uuidv7 } from 'uuidv7';
import ChatView from '../components/chat/ChatView';
import { useAppSelector } from '../redux/store';
import { selectDefaultModelForNewChat } from '../redux/slice/modelSlice';

export default function NewPage() {
  const [chatId] = useState(() => uuidv7());
  const model = useAppSelector((state) => selectDefaultModelForNewChat(state));

  if (!model) return null;

  return (
    <div className="h-full">
      <ChatView chat={{ id: chatId, model }} isNewChat={true} />
    </div>
  );
}
