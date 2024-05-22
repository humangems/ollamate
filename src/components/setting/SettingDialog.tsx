import { Button, Dialog, Text } from "@radix-ui/themes";
import { hideSetting } from "../../redux/slice/uiSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

export default function SettingDialog() {
  const settingOpen = useAppSelector(state => state.ui.settingOpen);
  const dispatch = useAppDispatch();

  const handleChange = (isOpen: boolean) => {
    if (!isOpen) {
      dispatch(hideSetting());
    }
  }

  const handleLogseqClick = async() => {
    await window.ipcRenderer.invoke('open-directory-dialog');
  }
  return (
    <Dialog.Root open={settingOpen} onOpenChange={handleChange}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Setting</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Import from Logseq, Obsdian or Roam Research
        </Dialog.Description>

        <Text size="2">Import from: </Text>
        <div>
          <Button variant="outline" onClick={handleLogseqClick}>Logseq</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}