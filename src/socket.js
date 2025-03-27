import { io } from 'socket.io-client';

const BACKEND_URL = process.env.MAIN_URL;

const URL = process.env.NODE_ENV === 'production' 
    ? BACKEND_URL
    : 'http://localhost:5000';

export const socket = io(URL, {
    transports: ['websocket'],
    cors:{
        origin: BACKEND_URL
    }
});