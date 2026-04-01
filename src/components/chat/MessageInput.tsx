import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpIcon, PlusIcon, XIcon } from 'lucide-react';
import { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import TextareaAutosize from 'react-textarea-autosize';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { llmChatThunk, type NewMessagePayloadType } from '../../redux/slice/messageSlice';
import { useAppDispatch } from '../../redux/store';

const formSchema = z.object({
  message: z.string().trim().min(1, 'Enter a message before sending.'),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type MessageInputProps = {
  chatId: string;
  model: string;
  isNewChat: boolean;
};

export default function MessageInput({ chatId, model, isNewChat = false }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      image: undefined,
    },
  });

  const image = useWatch({ control, name: 'image' });
  const message = useWatch({ control, name: 'message' });

  const onSubmit = async (values: FormValues) => {
    if (!model) {
      toast.error('Select a model before sending a message.');
      return;
    }

    const payload: NewMessagePayloadType = {
      chatId,
      content: values.message,
      model,
      isNewChat,
    };

    if (values.image) {
      payload.images = [values.image];
    }

    dispatch(llmChatThunk(payload));
    reset();
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    void handleSubmit(onSubmit)();
  };

  const handleFileClick = () => {
    inputFileRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.replace('data:', '').replace(/^.+,/, '');
      setValue('image', base64String, { shouldDirty: true });
    };

    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(onSubmit)(event);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <form onSubmit={handleFormSubmit} className="grid gap-2">
        <div
          className={cn(
            'bg-background/95 border-input shadow-xs supports-[backdrop-filter]:bg-background/80 rounded-2xl border backdrop-blur',
            'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]'
          )}
        >
          {image ? (
            <div className="border-b px-4 pt-4">
              <div className="bg-muted flex max-w-fit items-start gap-3 rounded-xl border p-2">
                <img
                  src={`data:image/jpeg;base64,${image}`}
                  alt="Selected upload"
                  className="max-h-16 rounded-md"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    setValue('image', undefined, { shouldDirty: true });
                    if (inputFileRef.current) {
                      inputFileRef.current.value = '';
                    }
                  }}
                >
                  <XIcon />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex items-end gap-2 p-2">
            <Button type="button" onClick={handleFileClick} variant="ghost" size="icon">
              <PlusIcon />
              <span className="sr-only">Attach an image</span>
            </Button>
            <input
              type="file"
              className="hidden"
              ref={inputFileRef}
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex-1">
              <Controller
                control={control}
                name="message"
                render={({ field }) => (
                  <TextareaAutosize
                    {...field}
                    maxRows={10}
                    minRows={1}
                    autoFocus
                    aria-invalid={Boolean(errors.message)}
                    placeholder="Type a message..."
                    className="placeholder:text-muted-foreground w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    onKeyDown={handleKeyDown}
                  />
                )}
              />
            </div>
            <Button type="submit" size="icon" disabled={!message?.trim() || isSubmitting}>
              <ArrowUpIcon />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
        <FieldError className="px-2" errors={[errors.message]} />
      </form>
    </div>
  );
}
