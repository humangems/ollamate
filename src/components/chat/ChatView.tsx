import { Button, TextArea, TextField } from '@radix-ui/themes';

import { useForm } from '@mantine/form';
import Markdown from 'react-markdown';

import { Chat, Message } from '../../lib/types';
import { newMessageThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';
import { RabbitIcon } from 'lucide-react';
import UserMessage from './UserMessage';
import OtherMessage from './OtherMessage';

type FormValues = {
  message: string;
};

type ChatViewProps = {
  chat: Chat;
};

export default function ChatView({ chat }: ChatViewProps) {
  const form = useForm<FormValues>({
    initialValues: {
      message: '',
    },
  });

  const messages = useAppSelector((state: RootState) => selectMessagesByChatId(state, chat.id));
  const model = useAppSelector((state) => state.ui.selectedModel);

  const dispatch = useAppDispatch();

  const handleSubmit = async (values: FormValues) => {
    if (model) {
      dispatch(newMessageThunk({ chat_id: chat.id, content: values.message, model }));
      form.reset();
    } else {
      alert('Please select a model first');
    }

  };


  return (
    <div>
      <div className="mt-4">
        {messages.map((message: Message) => {
          return message.role === 'user' ? (
            <UserMessage message={message} />
          ) : (
            <OtherMessage message={message} />
          );
        })}
      </div>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className="flex items-center mt-4">
          <TextArea
            color="gray"
            radius="full"
            variant="soft"
            placeholder="Enter your message"
            {...form.getInputProps('message')}
            className='flex-1'
          />
          <Button type="submit">Chat!</Button>
        </div>
      </form>
    </div>
  );
}
