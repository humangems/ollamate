import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { chatSelectors, updateChatTitleThunk } from '../../redux/slice/chatSlice';
import { stopRenaming } from '../../redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { Button } from '../ui/button';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter a chat title.')
    .max(120, 'Keep the title under 120 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function RenameForm({ chatId }: { chatId: string }) {
  const chat = useAppSelector((state) => chatSelectors.selectById(state.chats, chatId));
  const title = chat?.title ?? '';
  const dispatch = useAppDispatch();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title,
    },
  });

  useEffect(() => {
    reset({
      title,
    });
  }, [reset, title]);

  if (!chat) return null;

  const onSubmit = async (values: FormValues) => {
    await dispatch(updateChatTitleThunk({ chatId, title: values.title }));
    dispatch(stopRenaming());
  };

  const handleCancel = () => {
    dispatch(stopRenaming());
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <Field data-invalid={Boolean(errors.title)}>
        <FieldLabel htmlFor="chat-title" data-invalid={Boolean(errors.title)}>
          Title
        </FieldLabel>
        <Input
          id="chat-title"
          autoFocus
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        <FieldError errors={[errors.title]} />
      </Field>
      <div className="mt-2 flex items-center justify-end space-x-3">
        <Button variant="secondary" onClick={handleCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Rename
        </Button>
      </div>
    </form>
  );
}
