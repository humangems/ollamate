
import { Dialog } from "@radix-ui/themes";
import { stopRenaming } from "../../redux/slice/uiSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import RenameForm from "./RenameForm";

export default function RenameDialog() {
  const renamingChatId = useAppSelector(state => state.ui.renamingChatId);
  const dialogOpen = renamingChatId !== null;

  const dispatch = useAppDispatch();

  const handleChange = (isOpen: boolean) => {
    if (!isOpen) {
      dispatch(stopRenaming());
    }
  }

  if (!renamingChatId) return;

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={handleChange}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Rename chat</Dialog.Title>

        <RenameForm chatId={renamingChatId} />
      </Dialog.Content>
    </Dialog.Root>
  );
}