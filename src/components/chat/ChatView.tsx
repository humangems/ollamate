import { useEffect, useRef, useState } from 'react';
import { generateTitleThunk, updateModelThunk } from '../../redux/slice/chatSlice';
import { getMessagesThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import ModelSelect from '../ModelSelect';
import SidebarActions from '../SidebarActions';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import { Chat } from '../../lib/types';

type ChatViewProps = {
  chat: Chat;
  isNewChat: boolean;
};

export default function ChatView({ chat, isNewChat = false }: ChatViewProps) {
  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [internalModel, setInternalModel] = useState(chat.model);

  useEffect(() => {
    dispatch(getMessagesThunk(chat.id));
  }, [chat.id]);

  useEffect(() =>{
    setInternalModel(chat.model)
  }, [chat.model])

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
  }, [chat.id]);

  const handleModelChange = (value: string) => {
    if (!isNewChat) {
      dispatch(updateModelThunk({ chatId: chat.id, model: value }));
    } else {
      setInternalModel(value);
    }

  };

  return (
    <div className="flex flex-col w-full">
      <div className=" bg-[#fff] h-14 flex items-center shrink-0 drag-region">
        {!sidebarOpen && (
          <div className="mr-4">
            <SidebarActions />
          </div>
        )}
        <div className="no-drag-region px-6">
          <ModelSelect value={internalModel} onChange={handleModelChange} />
        </div>
      </div>

      <div className="flex-1 w-full">
        <MessageHistory chatId={chat.id} />
      </div>

      <div className="shrink-0 flex items-center py-4">
        <MessageInput chatId={chat.id} model={internalModel} isNewChat={isNewChat} />
      </div>
    </div>
  );
}
