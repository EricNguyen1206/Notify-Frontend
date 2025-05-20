import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import chatReducer from './features/chatSlice';
// import uiReducer from './features/uiSlice';
import friendReducer from './features/friendSlice';
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      chat: chatReducer,
      friend: friendReducer,
      // ui: uiReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];