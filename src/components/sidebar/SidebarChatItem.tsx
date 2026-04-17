import { chatSelectors, deleteChatThunk } from '@/redux/slice/chatSlice';
import { startRenaming } from '@/redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { MoreHorizontalIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';

export default function SidebarChatItem({
  chatId,
  isActive,
}: {
  chatId: string;
  isActive: boolean;
}) {
  const chat = useAppSelector((state) => chatSelectors.selectById(state.chats, chatId));

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const handleRename = () => {
    dispatch(startRenaming(chatId));
  };

  const handleDelete = () => {
    dispatch(deleteChatThunk(chat.id)).then(() => {
      navigate('/');
    });
  };
  const displayTitle = chat.title?.trim() ? chat.title : 'New chat';
  return (
    <SidebarMenuItem key={chat.id}>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={`/chat/${chat.id}`} title={displayTitle}>
          <span>{displayTitle}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="invisible group-hover/menu-item:visible peer-data-[active=true]:visible"
        >
          <SidebarMenuAction>
            <MoreHorizontalIcon />
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={handleRename}>
            <span>Rename title</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} variant="destructive">
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
