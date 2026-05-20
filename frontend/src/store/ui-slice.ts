import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  globalSearchOpen: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  globalSearchOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.mobileSidebarOpen = action.payload;
    },
    setGlobalSearchOpen(state, action: PayloadAction<boolean>) {
      state.globalSearchOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setMobileSidebarOpen,
  setGlobalSearchOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
