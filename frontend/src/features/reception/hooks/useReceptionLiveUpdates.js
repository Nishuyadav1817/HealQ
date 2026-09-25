import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../../constants/socketEvents';

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Reception's board covers every doctor in the hospital at once, but
 * QUEUE_UPDATED (see backend/src/sockets/socketEmitter.js) is broadcast
 * per doctor/date ROOM with a payload that has no doctorId in it — by
 * design, it's meant for a single-doctor queue-board consumer (Doctor
 * Assistant), not a multi-doctor one. Rather than guess which doctor an
 * event belongs to, this hook uses the event only as a signal that
 * "something changed" and asks React Query to refetch the source of
 * truth (see useTodaysAppointments) — sockets trigger the refresh,
 * REST remains the only thing actually rendered.
 *
 * Subscribes to today's queue room for every doctorId currently on the
 * board, and keeps that subscription set in sync as the board's doctor
 * list changes (appointments loading in, filters changing, etc).
 */
const useReceptionLiveUpdates = (doctorIds = []) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  const doctorIdsKey = [...new Set(doctorIds)].sort().join(',');

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    setIsConnected(socket.connected);
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    const date = todayISO();
    const uniqueIds = doctorIdsKey ? doctorIdsKey.split(',') : [];

    uniqueIds.forEach((doctorId) => {
      socket.emit(SOCKET_EVENTS.QUEUE_SUBSCRIBE, { doctor: doctorId, date });
    });

    const handleQueueUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['todaysAppointments'] });
    };
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);

    return () => {
      uniqueIds.forEach((doctorId) => {
        socket.emit(SOCKET_EVENTS.QUEUE_UNSUBSCRIBE, { doctor: doctorId, date });
      });
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED, handleQueueUpdated);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorIdsKey, queryClient]);

  return { isConnected };
};

export default useReceptionLiveUpdates;
