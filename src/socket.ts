import { io } from "socket.io-client";

const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';  // Fallback for local dev
const socket = io(backendURL);

export default socket;
