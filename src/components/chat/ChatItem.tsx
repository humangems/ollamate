import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Chat } from '../../lib/types';
import dayjs from 'dayjs';

type ChatItemProps = {
  chat: Chat;
  active: boolean;
};

export default function ChatItem({ chat, active }: ChatItemProps) {
  const title = chat.title || dayjs(chat.created_at).format('[New Chat] MMM D HH:mm');
  return (
    <Link to={`/chat/${chat.id}`}>
      <div
        title={title}
        className={clsx(
          'flex items-center whitespace-nowrap text-2 h-8 cursor-pointer px-2 rounded-2 hover:bg-gray-4 text-ellipsis overflow-hidden',
          active && 'bg-gray-4'
        )}
      >
        {title}
      </div>
    </Link>
  );
}
