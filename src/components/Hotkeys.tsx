import { useHotkeys } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/store';
import { toggleSidebar } from '../redux/slice/uiSlice';

export default function Hotkeys() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useHotkeys([
    [
      'mod + n',
      () => {
        navigate('/');
      },
    ],
    [
      'mod + e',
      () => {
        dispatch(toggleSidebar());
      },
    ],
  ]);
  return null;
}
