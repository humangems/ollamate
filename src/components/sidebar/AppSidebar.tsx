import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { getAllChatsThunk } from '@/redux/slice/chatSlice';
import { showSetting } from '@/redux/slice/uiSlice';
import { useAppDispatch } from '@/redux/store';
import { SettingsIcon } from 'lucide-react';
import { useEffect } from 'react';
import AppSidebarHeader from './AppSidebarHeader';
import HistorySidebarGroup from './HistorySidebarGroup';

export function AppSidebar() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllChatsThunk());
  }, []);

  const handleSetting = () => {
    dispatch(showSetting());
  };

  return (
    <Sidebar>
      <AppSidebarHeader />
      <SidebarContent>
        <HistorySidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSetting}>
                  <SettingsIcon size={16} />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
