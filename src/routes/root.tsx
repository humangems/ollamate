import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Hotkeys from '../components/Hotkeys';
import RenameDialog from '../components/chat/RenameDialog';
import SettingDialog from '../components/setting/SettingDialog';
import { getAllModelsThunk, getLastUsedModelNameThunk } from '../redux/slice/modelSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';

export default function RootPage() {
  const isFullscreen = useAppSelector((state) => state.ui.isFullscreen);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllModelsThunk());
    dispatch(getLastUsedModelNameThunk());
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" w-full">
        <Outlet />
      </main>
      <SettingDialog />
      <RenameDialog />
      <Hotkeys />
    </SidebarProvider>
  );
}
