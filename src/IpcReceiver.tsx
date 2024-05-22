import { useEffect } from "react";
import { useAppDispatch } from "./redux/store";
import { enterFullscreen, leaveFullscreen } from "./redux/slice/uiSlice";
import { importNoteThunk } from "./redux/slice/noteSlice";

export default function IpcReceiver() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!window.ipcRenderer) return;
    window.ipcRenderer.on('enter-full-screen-message', (_event, _message) => {
      dispatch(enterFullscreen())
    });
    window.ipcRenderer.on('leave-full-screen-message', (_event, _message) => {
      dispatch(leaveFullscreen());
    });
    window.ipcRenderer.on('import-note-message', (_event, _message) => {
      dispatch(importNoteThunk(_message))
    });

    return () => {
      if (!window.ipcRenderer) return;
      window.ipcRenderer.removeAllListeners('enter-full-screen-message');
      window.ipcRenderer.removeAllListeners('leave-full-screen-message');
      window.ipcRenderer.removeAllListeners('import-note-message');
    }
  }, [])

  return null;
}