import { io } from 'socket.io-client';

// Make sure this URL is your Render backend URL
const socket = io('https://vite-react-fr3n.onrender.com/', { transports: ['websocket'] }); 

export default socket;
