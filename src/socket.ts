// src/socket.ts
import { io } from "socket.io-client";

// Connect to the server (use your actual backend URL in production)
const socket = io("http://localhost:3000");

export default socket;
