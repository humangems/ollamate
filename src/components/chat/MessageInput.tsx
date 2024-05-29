import { useForm } from '@mantine/form';
import { ArrowUpIcon, PlusIcon } from 'lucide-react';
import { useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { llmChatThunk } from '../../redux/slice/messageSlice';
import { useAppDispatch } from '../../redux/store';

type FormValues = {
  message: string;
  image?: string;
};

type MessageInputProps = {
  chatId: string;
  model: string;
  isNewChat: boolean;
};

export default function MessageInput({ chatId, model,  isNewChat = false }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const form = useForm<FormValues>({
    initialValues: {
      message: '',
      image: undefined,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (model) {
      let payload = {
        chatId: chatId,
        content: values.message,
        model,
        isNewChat,
      };
      if (values.image) {
        //@ts-ignore
        payload['images'] = [values.image];
      }
      dispatch(llmChatThunk(payload));
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

  const handleFileClick = () => {
    inputFileRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function () {
      const result = reader.result as string;
      const base64String = result.replace('data:', '').replace(/^.+,/, '');
      form.setFieldValue('image', base64String);
    };

    reader.readAsDataURL(file);

  }

  return (
    <div className="max-w-3xl w-full px-4 mx-auto">
      <form onSubmit={form.onSubmit(handleSubmit)} ref={formRef}>
        <div className="flex min-h-12 relative items-center justify-between rounded-[24px] bg-gray-3 px-2 backdrop-blur">
          <div className="size-8 shrink-0">
            <div className="absolute bottom-2 ">
              <button
                className="size-8 rounded-full flex items-center justify-center hover:bg-gray-4"
                type="button"
                onClick={handleFileClick}
              >
                <PlusIcon size={20} />
                <input
                  type="file"
                  className="hidden"
                  ref={inputFileRef}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full">
              {form.values.image && (
                <div className="w-full pt-2 pb-1 pl-2">
                  <div className="max-h-12  ">
                    <img
                      src={`data:image/jpeg;base64,${form.values.image}`}
                      alt="image"
                      className="rounded-1 max-h-12"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center">
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
            </div>
          </div>

          <div className="shrink-0 size-8">
            <div className="absolute bottom-2">
              <button
                type="submit"
                disabled
                className="rounded-full size-8 bg-grayA-11 hover:bg-gray-4 text-[#fff] active:bg-gray-5 flex items-center justify-center"
              >
                <ArrowUpIcon size={20} className="" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
