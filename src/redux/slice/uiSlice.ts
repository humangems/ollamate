import { createSlice } from '@reduxjs/toolkit';

export interface UIState {
  writing: boolean;
  sidebarOpen: boolean;
  isFullscreen: boolean;
  settingOpen: boolean;
}

const initialState: UIState = {
  writing: false,
  sidebarOpen: true,
  isFullscreen: false,
  settingOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startEditing: (state) => {
      state.writing = true;
    },
    stopEditing: (state) => {
      state.writing = false;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    enterFullscreen: (state) => {
      state.isFullscreen = true;
    },
    leaveFullscreen: (state) => {
      state.isFullscreen = false;
    },
    showSetting: (state) => {
      state.settingOpen = true;
    },
    hideSetting: (state) => {
      state.settingOpen = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { startEditing, stopEditing, toggleSidebar, enterFullscreen, leaveFullscreen, showSetting, hideSetting } = uiSlice.actions;

export default uiSlice.reducer;
