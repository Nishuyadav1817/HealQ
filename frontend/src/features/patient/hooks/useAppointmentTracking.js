import { useEffect, useState } from 'react';
import { getSocket } from '../../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../../constants/socketEvents';

/**
 * Layers real-time updates on top of the REST-fetched appointment. The
 * server emits these events into the patient's own private room (see
 * backend/src/sockets/socket.js — every patient auto-joins `patient:<id>`
 * on connect), so no explicit subscribe/unsubscribe call is needed here,
 * unlike the doctor/reception queue-board views which opt into a specific
 * doctor/date room.
 *
 * Returns only the fields that can change live; the page merges these
 * over the REST snapshot rather than replacing it, since the socket
 * payloads are deliberately small deltas, not the full appointment.
 */
const useAppointmentTracking = (appointmentId) => {
  const [live, setLive] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !appointmentId) return undefined;

    const handleEtaUpdated = (payload) => {
      if (payload?.appointmentId && payload.appointmentId !== appointmentId) return;
      setLive((prev) => ({ ...prev, ...payload }));
    };

    const handleCalled = (payload) => {
      if (payload?.appointmentId && payload.appointmentId !== appointmentId) return;
      setLive((prev) => ({ ...prev, ...payload, called: true }));
    };

    socket.on(SOCKET_EVENTS.PATIENT_ETA_UPDATED, handleEtaUpdated);
    socket.on(SOCKET_EVENTS.PATIENT_CALLED, handleCalled);

    return () => {
      socket.off(SOCKET_EVENTS.PATIENT_ETA_UPDATED, handleEtaUpdated);
      socket.off(SOCKET_EVENTS.PATIENT_CALLED, handleCalled);
    };
  }, [appointmentId]);

  return live;
};

export default useAppointmentTracking;
