import { io } from 'socket.io-client';
import * as tokenStore from '../services/tokenStore';

/**
 * Socket.IO Client Wrapper
 *
 * Manages real-time connection for queue updates and notifications.
 * - Connects with JWT authentication
 * - Auto-reconnects on disconnect
 * - Re-authenticates when token refreshes
 * - Subscribes to patient-specific rooms
 */

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Initialize Socket.IO connection
 * Called after successful login with fresh access token
 */
export const connectSocket = () => {
  if (socket?.connected) {
    console.log('[socketClient] Already connected');
    return socket;
  }

  const token = tokenStore.getAccessToken();
  if (!token) {
    console.warn('[socketClient] Cannot connect without access token');
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    withCredentials: true,
  });

  // Reset reconnect counter on successful connection
  socket.on('connect', () => {
    console.log('[socketClient] Connected to server');
    reconnectAttempts = 0;
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('[socketClient] Connection error:', error.message);
    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[socketClient] Max reconnection attempts reached');
      // Dispatch event for AuthContext to handle (likely means auth is broken)
      window.dispatchEvent(new CustomEvent('socket:disconnected', {
        detail: { permanent: true },
      }));
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('[socketClient] Disconnected:', reason);
  });

  // Log reconnection attempts
  socket.on('reconnect_attempt', () => {
    console.log(`[socketClient] Reconnection attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS}`);
  });

  return socket;
};

/**
 * Disconnect Socket.IO connection
 * Called on logout
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[socketClient] Disconnected');
  }
};

/**
 * Reconnect socket with new token
 * Called after token refresh to ensure socket uses latest token
 */
export const reconnectSocket = () => {
  console.log('[socketClient] Reconnecting with new token...');

  // Disconnect existing connection
  if (socket) {
    socket.disconnect();
  }

  // Reconnect with fresh token
  connectSocket();
};

/**
 * Get socket instance
 * Lazy getter for components that need direct socket access
 */
export const getSocket = () => {
  if (!socket) {
    console.warn('[socketClient] Socket not initialized. Call connectSocket() first.');
    return null;
  }
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = () => {
  return socket?.connected || false;
};

export default {
  connectSocket,
  disconnectSocket,
  reconnectSocket,
  getSocket,
  isSocketConnected,
};
