import { io } from 'socket.io-client';
// import axios from 'axios';

const token = localStorage.getItem('token');

const socket = io('https://your-backend.onrender.com', {
  auth: {
    token
  }
});

export default socket;
