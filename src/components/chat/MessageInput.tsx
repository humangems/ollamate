import { useForm } from '@mantine/form';
import { ArrowUpIcon, PlusIcon } from 'lucide-react';
import { useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { llmChatThunk } from '../../redux/slice/messageSlice';
import { useAppDispatch } from '../../redux/store';

type FormValues = {
  message: string;
};

type MessageInputProps = {
  chatId: string;
  model: string;
  isNewChat: boolean;
};

export default function MessageInput({ chatId, model,  isNewChat = false }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<FormValues>({
    initialValues: {
      message: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (model) {
      dispatch(llmChatThunk({ chatId: chatId, content: values.message, model, isNewChat }));
      form.reset();
    } else {
      alert('Please select a model first');
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(form.values);
    }
  };

  return (
    <div className="max-w-3xl w-full px-4 mx-auto">
      <form onSubmit={form.onSubmit(handleSubmit)} ref={formRef}>
        <div className="flex min-h-12 relative items-center justify-between rounded-[24px] bg-gray-3 px-2 backdrop-blur">
          <div className="size-8 shrink-0">
            <div className="absolute bottom-2 ">
              <button
                className="size-8 rounded-full flex items-center justify-center hover:bg-gray-4"
                type="button"
              >
                <PlusIcon size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <TextareaAutosize
              maxRows={10}
              minRows={1}
              autoFocus
              placeholder="Type a message..."
              {...form.getInputProps('message')}
              className="w-full p-2 bg-transparent outline-none resize-none"
              onKeyDown={handleKeyUp}
            />
          </div>

          <div className="shrink-0 size-8">
            <div className="absolute bottom-2">
              <button
                type="submit"
                className="rounded-full size-8 bg-grayA-3 hover:bg-gray-4 active:bg-gray-5 flex items-center justify-center"
              >
                <ArrowUpIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
