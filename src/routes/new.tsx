import { nanoid } from '@reduxjs/toolkit';
import ChatView from '../components/chat/ChatView';
import { Chat } from '../lib/types';

export default function NewPage() {

  const chat:Chat = { id: nanoid(), title: '', created_at: Date.now(), updated_at: Date.now() };

  return (
    <div className="mx-auto max-w-3xl">
      <ChatView chat={chat} isNew={true}/>
    </div>
  );
}
