import { io } from 'socket.io-client';
import { getAccessToken } from '../services/tokenStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Module-level singleton — same reasoning as the backend's own
 * initializeSocket() guard: a second, independent socket connection from
 * the same tab would double-join every room and receive every event
 * twice. connectSocket() is idempotent; call it as many times as
 * convenient, it will only ever open one connection.
 */
let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getAccessToken() },
    autoConnect: true,
    reconnection: true,
  });

  return socket;
};

/** Read-only accessor for components/hooks that need to attach listeners
 * or emit subscribe/unsubscribe — never construct a second connection. */
export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
