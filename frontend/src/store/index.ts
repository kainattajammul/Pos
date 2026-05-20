import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import uiReducer from "./ui-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
