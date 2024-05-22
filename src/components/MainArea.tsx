import { Outlet } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import ModelsDropdown from "./ModelsDropdown";
import SidebarActions from "./SidebarActions";

export default function MainArea() {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  return (
    <div className="flex-1">
      <div className="h-11 drag-region flex items-center space-x-4">{!sidebarOpen && <SidebarActions />}

      <div className="no-drag-region flex items-center pl-4">
        <ModelsDropdown />
      </div>
      </div>
      <div className="h-[calc(100vh-44px)] overflow-y-auto">
        <div className="pt-14 z-0 px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}