import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from './ui/sidebar';

export default function Hotkeys() {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;

      const key = event.key.toLowerCase();

      if (key === 'n') {
        event.preventDefault();
        navigate('/');
        return;
      }

      if (key === 'e') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toggleSidebar]);

  return null;
}
