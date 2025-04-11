import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    sessionId: null,
    isCollaborative: false,
    connectedUsers: [],
    initialized: false
};

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSessionId: (state, action) => {
            state.sessionId = action.payload;
            state.isCollaborative = true;
            state.initialized = true;
        },
        clearSession: (state) => {
            return initialState;
        },
        addUser: (state, action) => {
            if (!state.connectedUsers.includes(action.payload)) {
                state.connectedUsers.push(action.payload);
            }
        },
        removeUser: (state, action) => {
            state.connectedUsers = state.connectedUsers.filter(id => id !== action.payload);
        }
    }
});

export const { setSessionId, clearSession, addUser, removeUser } = sessionSlice.actions;
export default sessionSlice.reducer;