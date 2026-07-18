import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../../constants/socketEvents';

/**
 * Explicitly opts into ONE doctor/date queue room at a time (see
 * backend/src/sockets/socket.js — QUEUE_SUBSCRIBE/QUEUE_UNSUBSCRIBE),
 * switching rooms cleanly whenever the assistant picks a different
 * doctor or date. QUEUE_UPDATED's payload only carries doctor-wide
 * counters (currentTokenNumber, totalTokensIssued, averageConsultation-
 * Minutes, status) — not the full current-patient/waiting-list detail
 * this dashboard renders — so it's used purely as a "something changed,
 * go refetch" signal; useQueue's REST fetch remains the only thing
 * actually rendered.
 */
const useQueueLiveUpdates = (doctorId, date) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !doctorId || !date) return undefined;

    setIsConnected(socket.connected);
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    socket.emit(SOCKET_EVENTS.QUEUE_SUBSCRIBE, { doctor: doctorId, date });

    const handleQueueUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['doctorQueue', doctorId, date] });
    };
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);

    return () => {
      socket.emit(SOCKET_EVENTS.QUEUE_UNSUBSCRIBE, { doctor: doctorId, date });
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [doctorId, date, queryClient]);

  return { isConnected };
};

export default useQueueLiveUpdates;
