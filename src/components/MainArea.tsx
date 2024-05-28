import { Outlet } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import ModelsDropdown from "./ModelsDropdown";
import SidebarActions from "./SidebarActions";
import { ShareIcon } from "lucide-react";
import { IconButton } from "@radix-ui/themes";

export default function MainArea() {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  return (
    <div className="flex-1">
      <div className="h-14 drag-region flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {!sidebarOpen && <SidebarActions />}{' '}
          <div className="no-drag-region flex items-center">
            <ModelsDropdown />
          </div>
        </div>

        <div>
          <div className="no-drag-region">
            <IconButton variant="ghost" color="gray" size="3"><ShareIcon size={16} /></IconButton>
          </div>
        </div>
      </div>

      <div className="z-0">
        <Outlet />
      </div>
    </div>
  );
}