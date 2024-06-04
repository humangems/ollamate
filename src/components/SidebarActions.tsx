import { IconButton } from '@radix-ui/themes';
import clsx from 'clsx';
import { PanelLeftIcon, SquarePenIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar } from '../redux/slice/uiSlice';
import { useAppDispatch } from '../redux/store';

export default function SidebarActions() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSidebarClick = () => {
    dispatch(toggleSidebar());
  };

  const handleNewClick = () => {
    navigate('/');
  };

  return (
    <div className={clsx('h-full flex items-center gap-4')}>
      <IconButton
        variant="ghost"
        className="no-drag-region"
        color="gray"
        size="3"
        onClick={handleSidebarClick}
      >
        <PanelLeftIcon size={16} />
      </IconButton>

      <IconButton
        variant="ghost"
        className="no-drag-region"
        color="gray"
        onClick={handleNewClick}
        size="3"
      >
        <SquarePenIcon size={16} />
      </IconButton>
    </div>
  );
}
