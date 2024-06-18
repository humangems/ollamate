import { useForm } from "@mantine/form";
import { Button, TextField } from "@radix-ui/themes";
import { chatSelectors, updateChatTitleThunk } from "../../redux/slice/chatSlice";
import { stopRenaming } from "../../redux/slice/uiSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

type FormValues = {
  title: string;
};

export default function RenameForm({ chatId }: { chatId: string }) {
  const chat = useAppSelector((state) => chatSelectors.selectById(state.chats, chatId));

  const dispatch = useAppDispatch();

  const form = useForm<FormValues>({
    initialValues: {
      title: chat.title || '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    dispatch(updateChatTitleThunk({ chatId, title: values.title}));
    dispatch(stopRenaming());
  }

  const handleCancel = () => {
    dispatch(stopRenaming());
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} action="xxx">
      <div>
        <TextField.Root className="w-full" {...form.getInputProps("title")} />
      </div>
      <div className="flex items-center justify-end mt-2 space-x-3">
        <Button color="gray" variant="soft" onClick={handleCancel} type="button">
          Cancel
        </Button>
        <Button type="submit">Rename</Button>
      </div>
    </form>
  );
}