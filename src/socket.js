import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' 
    ? 'https://whiteboardserver-drir.onrender.com'
    : 'http://localhost:5000';

export const socket = io(URL, {
    transports: ['websocket'],
    cors:{
        origin: 'https://whiteboardserver-drir.onrender.com'
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
});

socket.on('connect', () => {
    console.log('Connected to server');
});

export default socket;