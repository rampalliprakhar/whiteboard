import { createSlice } from '@reduxjs/toolkit'
import { connect } from 'socket.io-client';

const initialState = {
    sessionId: null,
    isCollaborative: false,
    connectedUsers: []
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