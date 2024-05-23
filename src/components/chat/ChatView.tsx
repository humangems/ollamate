
import { useForm } from '@mantine/form';

import { ArrowUpIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Chat, Message } from '../../lib/types';
import { newMessageThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import MessageInput from './MessageInput';
import OtherMessage from './OtherMessage';
import UserMessage from './UserMessage';


type FormValues = {
  message: string;
};

type ChatViewProps = {
  chat: Chat;
  isNew: boolean;
};

export default function ChatView({ chat }: ChatViewProps) {
  const form = useForm<FormValues>({
    initialValues: {
      message: '',
    },
  });

  const navigate = useNavigate();

  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));
  const model = useAppSelector((state) => state.ui.selectedModel);

  const dispatch = useAppDispatch();

  const handleSubmit = async (values: FormValues) => {
    if (model) {
      dispatch(newMessageThunk({ chat_id: chat.id, content: values.message, model })).then(() => {
        navigate(`/chat/${chat.id}`, { replace: true });
      })
      form.reset();
    } else {
      alert('Please select a model first');
    }


  };


  return (
    <div>
      <div className="mt-4 pb-32">
        {messages.map((message: Message) => {
          return message.role === 'user' ? (
            <UserMessage message={message} />
          ) : (
            <OtherMessage message={message} />
          );
        })}
      </div>

      <MessageInput chatId={chat.id} model={model} />
    </div>
  );
}
