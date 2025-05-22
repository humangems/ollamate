import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Hotkeys from '../components/Hotkeys';
import RenameDialog from '../components/chat/RenameDialog';
import SettingDialog from '../components/setting/SettingDialog';
import { getAllModelsThunk, getLastUsedModelNameThunk } from '../redux/slice/modelSlice';
import { useAppDispatch } from '../redux/store';

export default function RootPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllModelsThunk());
    dispatch(getLastUsedModelNameThunk());
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppSidebar />
        <main className=" w-full">
          <Outlet />
        </main>
        <SettingDialog />
        <RenameDialog />
        <Hotkeys />
      </SidebarProvider>
    </ThemeProvider>
  );
}
