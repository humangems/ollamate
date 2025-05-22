import { PanelLeftIcon, PenBoxIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { SidebarHeader, useSidebar } from '../ui/sidebar';

export default function AppSidebarHeader() {
  const navigate = useNavigate();

  const { toggleSidebar } = useSidebar();

  const handleNew = () => {
    navigate('/');
  };
  return (
    <>
      <SidebarHeader>
        <div className="h-[36px] drag-region pl-20 flex items-center">
          <Button onClick={toggleSidebar} variant="ghost" size="sm" className="no-drag-region">
            <PanelLeftIcon className="size-4" />
          </Button>
          <Button variant="ghost" className="no-drag-region" size="sm" onClick={handleNew}>
            <PenBoxIcon className="size-4" />
          </Button>
        </div>
      </SidebarHeader>
    </>
  );
}
