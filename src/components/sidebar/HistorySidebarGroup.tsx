import { chatSelectors } from '@/redux/slice/chatSlice';
import { useAppSelector } from '@/redux/store';
import { MoreHorizontalIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export default function HistorySidebarGroup() {
  const chats = useAppSelector((state) => chatSelectors.selectAll(state.chats));
  const { chatId } = useParams();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Conversations</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton asChild isActive={chat.id === chatId}>
                <Link to={`/chat/${chat.id}`} title={chat.title}>
                  <span>{chat.title}</span>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction>
                    <MoreHorizontalIcon />
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem>
                    <span>Rename title</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
