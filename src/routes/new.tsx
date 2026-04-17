import { useEffect, useState } from 'react';
import { uuidv7 } from 'uuidv7';
import ChatView from '../components/chat/ChatView';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { selectDefaultModelForNewChat } from '../redux/slice/modelSlice';
import { chatUpserted } from '../redux/slice/chatSlice';

export default function NewPage() {
  const [chatId] = useState(() => uuidv7());
  const dispatch = useAppDispatch();
  const model = useAppSelector((state) => selectDefaultModelForNewChat(state));

  useEffect(() => {
    if (!model) return;
    dispatch(chatUpserted({ id: chatId, model, created_at: Date.now() }));
  }, [chatId, dispatch, model]);

  if (!model) return null;

  return (
    <div className="h-full">
      <ChatView chat={{ id: chatId, model }} isNewChat={true} />
    </div>
  );
}
