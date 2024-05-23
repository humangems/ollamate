import { Link } from 'react-router-dom';
import { Chat } from '../../lib/types';

export default function ChatItem({ chat }: { chat: Chat }) {
  return (
    <Link to={`/chat/${chat.id}`}>
      <div className="flex items-center whitespace-nowrap h-8 cursor-pointer px-2 rounded-2 hover:bg-gray-4">
        {chat.created_at}
      </div>
    </Link>
  );
}
