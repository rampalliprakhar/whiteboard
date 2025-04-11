import { createSlice } from "@reduxjs/toolkit";
import { MENU_OBJECTS } from "@/constant";
const initialState = {
    activeMenuObject: MENU_OBJECTS.PENCIL,
    /*Clicking any object results to change from active to action*/
    actionMenuObject: null
}
//export const menus = createSlice({
export const menus = createSlice({
  name: "menu",
  initialState,
  reducers: {
    clickMenuObject: (state, action) => {
        state.activeMenuObject = action.payload || initialState.activeMenuObject;
    },
    clickActionObject: (state, action) => {
        state.actionMenuObject = action.payload;
    },
  },
});

export const emitMenuAction = (menuObject, actionObject = null) => {
  socket.emit('menuAction', {
      menuObject,
      actionObject,
      sessionId: store.getState().session.sessionId
  });
};

export const {clickMenuObject, clickActionObject} = menus.actions;

export default menus.reducer;