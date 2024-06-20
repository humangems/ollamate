import { Button } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { PenBoxIcon, SettingsIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chatSelectors, getAllChatsThunk } from '../redux/slice/chatSlice';
import { showSetting } from '../redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import ChatItem from './chat/ChatItem';

export default function Sidebar() {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const chats = useAppSelector(state => chatSelectors.selectAll(state.chats));
  const { chatId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllChatsThunk());
  }, [])

  const handleNew = () => {
    navigate('/');
  }

  const handleSetting = () => {
    dispatch(showSetting());
  }

  return (
    <motion.div
      initial={{ width: 260 }}
      animate={{ width: sidebarOpen ? 260 : 0 }}
      className="bg-gray-3 shrink-0 overflow-hidden z-10"
    >
      <div className="flex flex-col w-[260px]">
        <div className="h-14 drag-region shrink-0"></div>
        <div className="flex-1 px-2 flex flex-col">
          <div className="gap-y-2 space-y-3">
            <Button
              className="w-full justify-start"
              variant="soft"
              color="gray"
              onClick={handleNew}
            >
              <PenBoxIcon size={16} />
              New Chat
            </Button>
          </div>

          <div className="flex-1 mt-4">
            <div className="text-1 px-2 py-1 shrink-0">Conversations</div>
            <div className="overflow-y-auto h-[calc(100vh-170px)] space-y-[1px]">
              {chats.map((chat) => (
                <ChatItem chat={chat} key={chat.id} active={chat.id === chatId} />
              ))}
            </div>
          </div>
        </div>

        <div className="px-4">
          <Button className="w-full h-6 justify-start" variant="ghost" color="gray" onClick={handleSetting}>
            <SettingsIcon size={16} />
            Settings
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
