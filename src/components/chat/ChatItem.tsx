import clsx from 'clsx';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { Chat } from '../../lib/types';
import { ContextMenu } from '@radix-ui/themes';
import { useAppDispatch } from '../../redux/store';
import { deleteChatThunk } from '../../redux/slice/chatSlice';

type ChatItemProps = {
  chat: Chat;
  active: boolean;
};

export default function ChatItem({ chat, active }: ChatItemProps) {
  const title = chat.title || dayjs(chat.created_at).format('[New Chat] MMM D HH:mm');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleDelete = () => {
    dispatch(deleteChatThunk(chat.id)).then(() => {
      navigate('/');
    })
  }
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div className="relative">
          <Link
            to={`/chat/${chat.id}`}
            title={title}
            className={clsx(
              'text-2 leading-[32px] px-2 block cursor-default whitespace-nowrap text-ellipsis overflow-hidden rounded-2 hover:bg-gray-6',
              active && 'bg-gray-6'
            )}
          >
            {title}
          </Link>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>Edit</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item color="red" onClick={handleDelete}>
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
