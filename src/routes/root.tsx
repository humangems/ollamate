import { Theme } from '@radix-ui/themes';
import { Outlet } from 'react-router-dom';
import Hotkeys from '../components/Hotkeys';
import Sidebar from '../components/Sidebar';
import SettingDialog from '../components/setting/SettingDialog';

export default function RootPage() {
  return (
    <Theme accentColor="blue">
      <div className="h-screen flex">
        <Sidebar />
        <div className='flex-1'>
          <Outlet />
        </div>
      </div>
      <SettingDialog />
      <Hotkeys />
    </Theme>
  );
}
