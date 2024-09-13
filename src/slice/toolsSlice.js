import { createSlice } from "@reduxjs/toolkit";
import { MENU_OBJECTS, COLORS} from "@/constant";
const initialState = {
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
    [MENU_OBJECTS.SAVE]:{},
}
export const toolSlice = createSlice({
    name: "tool",
    initialState,
    reducers: {
      changeColor: (state, action) => {
          state[action.payload.object].color = action.payload.color;
      },
      changeBrushSize: (state, action) => {
          state[action.payload.object].size = action.payload.size;
      },
    },
});

export const {changeColor, changeBrushSize} = toolSlice.actions;

export default toolSlice.reducer;