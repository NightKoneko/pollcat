import { io } from 'socket.io-client';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const token = localStorage.getItem('token');

const socket = io(backendURL, {
  auth: {
    token: token || '',
  },
  transports: ['websocket'],
});

export default socket;
