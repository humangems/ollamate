import { Button, TextField } from '@radix-ui/themes';

import { useForm } from '@mantine/form';
import Markdown from 'react-markdown';

import { Chat } from '../../lib/types';
import { newMessageThunk, selectMessagesByChatId } from '../../redux/slice/messageSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';

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
      <h1>Chat: Redux Version</h1>
      <hr />
      <div className="mt-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-4">
            <div className="w-12 shrink-0 font-medium text-gray-11 text-2">
              {message.role === 'user' ? 'You' : 'Assit.'}
            </div>
            <div className="prose flex-1">
              <Markdown>{message.content}</Markdown>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className="flex items-center mt-4">
          <TextField.Root {...form.getInputProps('message')} className="flex-1"></TextField.Root>
          <Button type="submit">Chat!</Button>
        </div>
      </form>
    </div>
  );
}
