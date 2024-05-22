import { Theme } from '@radix-ui/themes';
import MainArea from '../components/MainArea';
import Sidebar from '../components/Sidebar';
import SettingDialog from '../components/setting/SettingDialog';
import Hotkeys from '../components/Hotkeys';

export default function RootPage() {
  return (
    <Theme accentColor="blue">
      <div className="h-screen flex">
        <Sidebar />
        <MainArea />
      </div>
      <SettingDialog />
      <Hotkeys />
    </Theme>
  );
}
