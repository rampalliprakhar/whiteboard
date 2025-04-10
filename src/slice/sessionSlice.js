import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    sessionId: null,
    isCollaborative: false,
};

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSessionId: (state, action) => {
            state.sessionId = action.payload;
            state.isCollaborative = true;
        },
        clearSession: (state) => {
            state.sessionId = null;
            state.isCollaborative = false;
        }
    }
});

export const { setSessionId, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;