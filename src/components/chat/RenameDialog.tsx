import { stopRenaming } from '../../redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import RenameForm from './RenameForm';

export default function RenameDialog() {
  const renamingChatId = useAppSelector((state) => state.ui.renamingChatId);
  const dialogOpen = renamingChatId !== null;

  const dispatch = useAppDispatch();

  const handleChange = (isOpen: boolean) => {
    if (!isOpen) {
      dispatch(stopRenaming());
    }
  };

  if (!renamingChatId) return;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename chat</DialogTitle>
        </DialogHeader>

        <RenameForm chatId={renamingChatId} />
      </DialogContent>
    </Dialog>
  );
}
