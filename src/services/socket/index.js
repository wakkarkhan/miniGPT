import { io } from "socket.io-client";
import config from "./config";

let socket = null;

export const initializeSocket = () => {

  socket = io(config.SOCKET_URL, {
    transports: ['websocket'],
    query: {
      "token": `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOTY1ODQyNC1mZmNlLTQzZTUtOWUxYy0xMjAyNjFiYWFhNDQiLCJleHAiOjE3NDY0MDg0Nzd9.53T4W0Dqzq-XEj2LCO7VRZZsgs44rOTw3B5TJYMn_Yk`
    }
  });
};

export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket) {
    initializeSocket();
  }
  return socket;
};
