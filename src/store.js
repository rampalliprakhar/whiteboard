import { configureStore } from "@reduxjs/toolkit";
import MenuReducer from '@/slice/menuSlice'
import ToolsReducer from '@/slice/toolsSlice'
import SessionReducer from '@/slice/sessionSlice'

export const store = configureStore({
    reducer: {
        menu: MenuReducer,
        tools: ToolsReducer,
        session: SessionReducer,
    },
    middleware: (getDefaultMiddleware) =>
         getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['socket/connect', 'socket/disconnect'],
                ignoredPaths: ['socket']
            }
         })
});