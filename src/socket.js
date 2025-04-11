import { io } from 'socket.io-client';
import { store } from './store';
import { addUser, removeUser } from './slice/sessionSlice';
import { v4 as uuidv4 } from 'uuid';

const URL = process.env.NODE_ENV === 'production' 
    ? 'https://whiteboardserver-drir.onrender.com'
    : 'http://localhost:5000';

export const socket = io(URL, {
    transports: ['websocket', 'polling'],
    cors:{
        origin: ['https://whiteboardserver-drir.onrender.com', 'https://whiteboard-two-gilt.vercel.app'],
        credentials: true,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
});

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('userJoined', (userId) => {
    store.dispatch(addUser(userId));
});

socket.on('userLeft', (userId) => {
    store.dispatch(removeUser(userId));
});

export const joinWhiteboardSession = (sessionId) => {
    socket.emit('joinSession', sessionId);
    return sessionId;
};

export const generateSessionId = () => {
    return uuidv4();
};

export default socket;