import { useEffect, useRef, useState } from 'react';
import { generateTitleThunk, updateModelThunk } from '../../redux/slice/chatSlice';
import { getMessagesThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import ModelSelect from '../ModelSelect';
import SidebarActions from '../SidebarActions';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';

type ChatViewProps = {
  chatId: string;
  model: string;
  isNewChat: boolean;
};

export default function ChatView({ chatId, model, isNewChat = false }: ChatViewProps) {
  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chatId));
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [internalModel, setInternalModel] = useState(model);

  useEffect(() => {
    dispatch(getMessagesThunk(chatId));
  }, [chatId]);

  useEffect(() =>{
    setInternalModel(model)
  }, [model])

  useEffect(() => {
    // if (chat.title) return; // TODO

    if (messages.length !== 2) return;

    dispatch(
      generateTitleThunk({
        chatId: chatId,
        messages: messages.map((m) => {
          return {
            role: m.role,
            content: m.content,
          };
        }),
        model: internalModel,
      })
    );
  }, [chatId]);

  const handleModelChange = (value: string) => {
    if (!isNewChat) {
      dispatch(updateModelThunk({ chatId: chatId, model: value }));
    } else {
      setInternalModel(value);
    }

  };

  console.log(internalModel);

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
        <MessageHistory chatId={chatId} />
      </div>

      <div className="shrink-0 flex items-center py-4">
        <MessageInput chatId={chatId} model={internalModel} isNewChat={isNewChat} />
      </div>
    </div>
  );
}
