import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/api";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setHydrated, logout } = authSlice.actions;
export default authSlice.reducer;
