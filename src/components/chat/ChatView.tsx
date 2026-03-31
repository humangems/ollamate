import { cn } from '@/lib/utils';
import { PanelLeftIcon, PenBoxIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat } from '../../lib/types';
import { generateTitleThunk, updateModelThunk } from '../../redux/slice/chatSlice';
import { getMessagesThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import ModelSelect from '../ModelSelect';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

export default function ChatView({ chat, isNewChat = false }: ChatViewProps) {
  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));
  const dispatch = useAppDispatch();
  const [internalModel, setInternalModel] = useState(chat.model);
  const { state: sidebarState, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const handleNewChat = () => {
    navigate('/');
  };

  useEffect(() => {
    dispatch(getMessagesThunk(chat.id));
  }, [chat.id, dispatch]);

  useEffect(() => {
    setInternalModel(chat.model);
  }, [chat.model]);

  useEffect(() => {
    if (chat.title) return;

    if (messages.length !== 2) return;

    dispatch(
      generateTitleThunk({
        chatId: chat.id,
        messages: messages.map((m) => {
          return {
            role: m.role,
            content: m.content,
          };
        }),
        model: internalModel,
      })
    );
  }, [chat.id, chat.title, dispatch, internalModel, messages]);

  const handleModelChange = (value: string) => {
    if (!isNewChat) {
      dispatch(updateModelThunk({ chatId: chat.id, model: value }));
    } else {
      setInternalModel(value);
    }
  };

  return (
    <div className="flex flex-col relative h-full">
      <div
        className={cn('bg-background h-[52px] flex items-center shrink-0 drag-region pl-4', {
          'pl-20': sidebarState === 'collapsed',
        })}
      >
        {sidebarState === 'collapsed' && (
          <>
            <Button variant="ghost" size="sm" className="no-drag-region" onClick={toggleSidebar}>
              <PanelLeftIcon />
            </Button>
            <Button variant="ghost" size="sm" className="no-drag-region" onClick={handleNewChat}>
              <PenBoxIcon />
            </Button>
          </>
        )}

        <ModelSelect value={internalModel} onChange={handleModelChange} />
      </div>

      <div className="flex-1 w-full h-full">
        <MessageHistory chatId={chat.id} />
      </div>

      <div className="absolute bottom-6 left-0 right-0">
        <MessageInput chatId={chat.id} model={internalModel} isNewChat={isNewChat} />
      </div>
    </div>
  );
}
