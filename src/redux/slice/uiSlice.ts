import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface UIState {
  writing: boolean;
  sidebarOpen: boolean;
  isFullscreen: boolean;
  settingOpen: boolean;
  selectedModel: string | null;
}

const initialState: UIState = {
  writing: false,
  sidebarOpen: true,
  isFullscreen: false,
  settingOpen: false,
  selectedModel: null,
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
    selectModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const { startEditing, stopEditing, toggleSidebar, enterFullscreen, leaveFullscreen, showSetting, hideSetting, selectModel } = uiSlice.actions;

export default uiSlice.reducer;
