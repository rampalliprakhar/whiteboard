import { createSlice } from "@reduxjs/toolkit";
import { MENU_OBJECTS, COLORS} from "@/constant";
const initialState = {
    activeMenuObject: MENU_OBJECTS.PENCIL,
    color: COLORS.BLACK,
    size: 5,
    backgroundColor: COLORS.WHITE,
    // states for each item, and its functions
    [MENU_OBJECTS.PENCIL]:{
        // Default color when clicked
        color: COLORS.BLACK,
        size: 5,
    },
    [MENU_OBJECTS.ERASER]:{
        // Default values when clicked
        color: COLORS.WHITE,
        size: 5,
    },
    /* For future design purpose
    [MENU_OBJECTS.CIRCLE]:{},
    [MENU_OBJECTS.LINE]:{},
    */
    [MENU_OBJECTS.UNDO]:{},
    [MENU_OBJECTS.REDO]:{},
    [MENU_OBJECTS.CLEAR]:{},
    [MENU_OBJECTS.SAVE]:{},
    [MENU_OBJECTS.BACKGROUND]:{
        color: COLORS.WHITE,
    },
}
export const toolSlice = createSlice({
    name: "tools",
    initialState,
    reducers: {
      changeColor: (state, action) => {
          state[action.payload.object].color = action.payload.color;
      },
      changeBrushSize: (state, action) => {
          state[action.payload.object].size = action.payload.size;
      },
      changeBackgroundColor: (state, action) => {
        state.backgroundColor = action.payload;
      }
    },
});

export const {changeBackgroundColor, changeColor, changeBrushSize, changeActiveMenuObject} = toolSlice.actions;

export default toolSlice.reducer;