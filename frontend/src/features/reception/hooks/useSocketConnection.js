import { useEffect, useState } from 'react';
import { getSocket } from '../../../sockets/socketClient';

/** Whether the app's one shared socket (see sockets/socketClient) is
 * currently connected — no room subscriptions, just connectivity. Used
 * by the reception header's live indicator; useReceptionLiveUpdates
 * remains the source of truth for the doctor-room subscriptions that
 * actually drive board refetches. */
const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(() => !!getSocket()?.connected);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    setIsConnected(socket.connected);
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return isConnected;
};

export default useSocketConnection;
