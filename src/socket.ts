import { io } from 'socket.io-client';

const socket = io('https://vite-react-fr3n.onrender.com/', { transports: ['websocket'] }); 

export default socket;