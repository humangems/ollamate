import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Chat } from '../../lib/types';
import { generateTitleThunk, updateModelThunk } from '../../redux/slice/chatSlice';
import { getMessagesThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import ModelSelect from '../ModelSelect';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';

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
    <div className="flex flex-col relative h-full">
      <div className=" bg-[#fff] h-[52px] flex items-center shrink-0 drag-region">

        <div className={clsx("no-drag-region px-6 flex items-center", !sidebarOpen && "pl-40")}>
          <ModelSelect value={internalModel} onChange={handleModelChange} />
        </div>
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
