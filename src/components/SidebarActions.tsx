import { IconButton } from '@radix-ui/themes';
import { PanelLeftIcon, SquarePenIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toggleSidebar } from '../redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';
import clsx from 'clsx';

export default function SidebarActions() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isFullscreen = useAppSelector(state => state.ui.isFullscreen);

  const handleSidebarClick = () => {
    dispatch(toggleSidebar());
  };

  const handleNewClick = () => {
    navigate('/');
  };

  return (
    <div className={clsx('h-full flex items-center gap-4', isFullscreen ? 'pl-4' : 'pl-[84px]')}>
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
