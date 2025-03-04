import { Theme } from '@radix-ui/themes';
import { Outlet } from 'react-router-dom';
import Hotkeys from '../components/Hotkeys';
import Sidebar from '../components/Sidebar';
import SettingDialog from '../components/setting/SettingDialog';
import { useAppDispatch, useAppSelector } from '../redux/store';
import clsx from 'clsx';
import SidebarActions from '../components/SidebarActions';
import RenameDialog from '../components/chat/RenameDialog';
import { useEffect } from 'react';
import { getAllModelsThunk, getLastUsedModelNameThunk } from '../redux/slice/modelSlice';

export default function RootPage() {
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllModelsThunk());
    dispatch(getLastUsedModelNameThunk());
  }, []);

  return (
    <Theme accentColor="blue" grayColor="gray">
      <div className="h-screen relative">
        <div className="flex z-0 w-full h-full">
          <Sidebar />
          <div className="flex-1 z-0 h-full">
            <Outlet />
          </div>
        </div>
        <div
          className={clsx(
            'absolute h-[52px] flex items-center no-drag-region z-10 top-0',
            isFullscreen ? 'left-4' : 'left-[84px]'
          )}
        >
          <SidebarActions />
        </div>
      </div>
      <SettingDialog />
      <RenameDialog />
      <Hotkeys />
    </Theme>
  );
}
