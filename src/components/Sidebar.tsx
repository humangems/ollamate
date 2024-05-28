import { TextField } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { SearchIcon, SettingsIcon } from 'lucide-react';
import { showSetting } from '../redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import SidebarActions from './SidebarActions';
import { chatSelectors, getAllChatsThunk } from '../redux/slice/chatSlice';
import ChatItem from './chat/ChatItem';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Sidebar() {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const chats = useAppSelector(state => chatSelectors.selectAll(state.chats));
  const { chatId } = useParams();

  useEffect(() => {
    dispatch(getAllChatsThunk());
  }, [])

  const handleSettingClick = () => {
    dispatch(showSetting());
  };

  return (
    <motion.div
      initial={{ width: 260 }}
      animate={{ width: sidebarOpen ? 260 : 0 }}
      className="bg-gray-2 shrink-0"
    >
      <div className="flex flex-col">
        <div className="h-14 drag-region shrink-0">
          {sidebarOpen && <SidebarActions />}
        </div>
        <div className="flex-1 p-2 flex flex-col">
          <div className="gap-y-2 space-y-3">
            <TextField.Root variant="soft" color="gray">
              <TextField.Slot>
                <SearchIcon size={16} />
              </TextField.Slot>
            </TextField.Root>
          </div>

          <div className="flex-1">
            {chats.map((chat) => (
              <ChatItem chat={chat} key={chat.id} active={chat.id === chatId} />
            ))}
          </div>

          <div className="hidden">
            <button
              className="flex items-center text-2 gap-2 cursor-default active:bg-gray-5 w-full h-8 px-2 rounded-1"
              onClick={handleSettingClick}
            >
              <SettingsIcon size={14} />
              Setting
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
