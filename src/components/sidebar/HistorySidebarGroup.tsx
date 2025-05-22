import { chatSelectors } from '@/redux/slice/chatSlice';
import { useAppSelector } from '@/redux/store';
import { useParams } from 'react-router-dom';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '../ui/sidebar';
import SidebarChatItem from './SidebarChatItem';

export default function HistorySidebarGroup() {
  const chats = useAppSelector((state) => chatSelectors.selectAll(state.chats));
  const { chatId } = useParams();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Conversations</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarChatItem key={chat.id} chatId={chat.id} isActive={chat.id === chatId} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
