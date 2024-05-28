import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Chat } from '../../lib/types';

type ChatItemProps = {
  chat: Chat,
  active: boolean;
}

export default function ChatItem({ chat, active }: ChatItemProps) {

  return (
    <Link to={`/chat/${chat.id}`}>
      <div className={clsx("flex items-center whitespace-nowrap text-2 h-8 cursor-pointer px-2 rounded-2 hover:bg-gray-4", active && 'bg-gray-4')}>
        {chat.title || chat.created_at}
      </div>
    </Link>
  );
}
