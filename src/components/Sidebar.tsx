import { TextField } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { chatSelectors, getAllChatsThunk } from '../redux/slice/chatSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import SidebarActions from './SidebarActions';
import ChatItem from './chat/ChatItem';

export default function Sidebar() {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const chats = useAppSelector(state => chatSelectors.selectAll(state.chats));
  const { chatId } = useParams();

  useEffect(() => {
    dispatch(getAllChatsThunk());
  }, [])

  return (
    <motion.div
      initial={{ width: 260 }}
      animate={{ width: sidebarOpen ? 260 : 0 }}
      className="bg-gray-2 shrink-0 overflow-hidden"
    >
      <div className="flex flex-col w-[260px]">
        <div className="h-14 drag-region shrink-0">{sidebarOpen && <SidebarActions />}</div>
        <div className="flex-1 p-2 flex flex-col">
          <div className="gap-y-2 space-y-3">
            <TextField.Root variant="soft" color="gray">
              <TextField.Slot>
                <SearchIcon size={16} />
              </TextField.Slot>
            </TextField.Root>
          </div>

          <div className="flex-1 mt-4">
            <div className='text-1 px-2 py-1 shrink-0'>Conversations</div>
            <div className='overflow-y-auto h-[calc(100vh-146px)] space-y-[1px]'>
              {chats.map((chat) => (
                <ChatItem chat={chat} key={chat.id} active={chat.id === chatId} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
