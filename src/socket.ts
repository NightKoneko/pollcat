import { io } from 'socket.io-client';

// Make sure this URL is your Render backend URL
const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const socket = io(backendURL, { transports: ['websocket'] }); 

export default socket;
