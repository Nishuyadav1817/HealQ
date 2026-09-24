import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSocket } from '../../../sockets/socketClient';
import { SOCKET_EVENTS } from '../../../constants/socketEvents';

/**
 * Surfaces the same real-time events useAppointmentTracking already
 * consumes (patient:called, patient:eta-updated) as a persistent,
 * glanceable notification list — plus a generic addNotification() for
 * pages to push local notices (e.g. "booking confirmed" right after
 * BookingPage's existing mutation succeeds). This does NOT talk to any
 * new backend route and does NOT change what the booking/queue
 * mutations do — it only listens to events that already exist and
 * keeps a small client-side list of them for the bell in PatientTopNav.
 */
const NotificationsContext = createContext(undefined);

let idCounter = 0;
const nextId = () => `n${Date.now()}-${idCounter++}`;

export const NotificationsProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addNotification = useCallback((notification) => {
    setItems((prev) =>
      [
        {
          id: nextId(),
          read: false,
          createdAt: new Date().toISOString(),
          tone: 'info',
          ...notification,
        },
        ...prev,
      ].slice(0, 20)
    );
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleCalled = (payload) => {
      addNotification({
        title: "You're being called",
        description: 'Please proceed to the consultation room now.',
        tone: 'urgent',
        appointmentId: payload?.appointmentId,
      });
    };

    const handleEta = (payload) => {
      if (payload?.queuePosition == null && payload?.estimatedWaitingMinutes == null) return;
      addNotification({
        title: 'Queue update',
        description: [
          payload?.queuePosition != null ? `Position #${payload.queuePosition} in queue` : null,
          payload?.estimatedWaitingMinutes != null ? `~${payload.estimatedWaitingMinutes} min wait` : null,
        ]
          .filter(Boolean)
          .join(' · '),
        tone: 'info',
        appointmentId: payload?.appointmentId,
      });
    };

    const handleVerified = (payload) => {
      addNotification({
        title: 'Appointment confirmed',
        description: 'Your booking has been verified by the hospital.',
        tone: 'success',
        appointmentId: payload?.appointmentId,
      });
    };

    socket.on(SOCKET_EVENTS.PATIENT_CALLED, handleCalled);
    socket.on(SOCKET_EVENTS.PATIENT_ETA_UPDATED, handleEta);
    socket.on(SOCKET_EVENTS.PATIENT_VERIFIED, handleVerified);

    return () => {
      socket.off(SOCKET_EVENTS.PATIENT_CALLED, handleCalled);
      socket.off(SOCKET_EVENTS.PATIENT_ETA_UPDATED, handleEta);
      socket.off(SOCKET_EVENTS.PATIENT_VERIFIED, handleVerified);
    };
  }, [addNotification]);

  const unreadCount = items.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({ items, unreadCount, addNotification, markAllRead }),
    [items, unreadCount, addNotification, markAllRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (ctx === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider.');
  }
  return ctx;
};
