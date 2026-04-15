import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from '../features/workspace/workspaceSlice';
import communityReducer from '../features/community/communitySlice';

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    community: communityReducer,
    // futuramente, migrações de zustand para rtk do auth seriam adicionadas aqui
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
