import { configureStore } from "@reduxjs/toolkit";
import MenuReducer from '@/slice/menuSlice'
import ToolsReducer from '@/slice/toolsSlice'

export const store = configureStore({
    reducer: {
        menu: MenuReducer,
        tools: ToolsReducer,
    },
});