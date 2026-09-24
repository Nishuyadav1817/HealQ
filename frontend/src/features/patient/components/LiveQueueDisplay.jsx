import React from "react";
import { useEffect, useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { AuthContext } from '../../../context/AuthContext';
import Card from '../../../components/ui/Card';
import apiClient from '../../../services/apiClient';

/**
 * Live Patient Queue Display
 *
 * Shows patient their position in queue with real-time updates via Socket.IO.
 * Falls back to polling if Socket.IO disconnects.
 * Only polls while actively tracking an appointment (not aggressive).
 */
const LiveQueueDisplay = ({ appointmentId, doctorId, appointmentDate }) => {
  const { user } = useContext(AuthContext);
  const [queuePosition, setQueuePosition] = useState(null);
  const [currentToken, setCurrentToken] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(null);
  const [estimatedReportingTime, setEstimatedReportingTime] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fallback polling every 15 seconds if Socket.IO disconnects
  const { data: pollData, refetch: pollQueue } = useQuery({
    queryKey: ['queue', doctorId, appointmentDate],
    queryFn: async () => {
      const response = await apiClient.get(`/queue/${doctorId}?date=${appointmentDate}`);
      return response.data?.data?.queue || null;
    },
    enabled: !socketConnected && !!appointmentId, // Only poll if socket disconnected
    refetchInterval: 15000, // Every 15 seconds
    staleTime: 5000,
  });

  useEffect(() => {
    if (!user || !appointmentId) return;

    // Initialize Socket.IO connection
    const socket = io(window.location.origin, {
      auth: { token: localStorage.getItem('accessToken') },
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('[queue] Connected to real-time updates');
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      console.log('[queue] Disconnected from real-time, will poll instead');
    });

    // Listen for queue position updates
    socket.on('queue:position-updated', (data) => {
      setQueuePosition(data.queuePosition);
      setCurrentToken(data.currentTokenNumber);
      setEstimatedWait(data.estimatedWaitingMinutes);
      setEstimatedReportingTime(data.estimatedReportingTime);
      setLastUpdate(new Date());
    });

    // Listen for patient called notification
    socket.on('queue:patient-called', (data) => {
      setQueuePosition(0); // Patient is being called now
    });

    // Subscribe to queue updates for this doctor/date
    socket.emit('queue:subscribe', {
      doctor: doctorId,
      date: appointmentDate,
    });

    return () => {
      socket.emit('queue:unsubscribe', {
        doctor: doctorId,
        date: appointmentDate,
      });
      socket.disconnect();
    };
  }, [user, appointmentId, doctorId, appointmentDate]);

  // Update from polling data if Socket.IO not available
  useEffect(() => {
    if (!socketConnected && pollData) {
      const myEntry = pollData.entries.find((e) => e.appointment === appointmentId);
      if (myEntry) {
        setQueuePosition(myEntry.queuePosition);
        setCurrentToken(pollData.currentTokenNumber);
        setEstimatedWait(myEntry.estimatedWaitingMinutes);
        setEstimatedReportingTime(myEntry.estimatedReportingTime);
        setLastUpdate(new Date());
      }
    }
  }, [pollData, socketConnected, appointmentId]);

  const formatTime = (dateTime) => {
    if (!dateTime) return 'Calculating...';
    return new Date(dateTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQueueStatus = () => {
    if (queuePosition === 0) return '🎉 CALLING NOW!';
    if (!queuePosition) return 'Processing...';
    if (queuePosition <= 3) return '🟢 Your turn soon';
    if (queuePosition <= 10) return '🟡 Wait in progress';
    return '⏳ Please wait';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Live Queue Status</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-orange-500'}`}
          />
          <span className="text-xs font-medium text-gray-600">
            {socketConnected ? 'Live' : 'Polling'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Current Token */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-xs uppercase text-gray-600 mb-1">Now Serving</p>
          <p className="text-3xl font-bold text-blue-600">#{currentToken || 0}</p>
        </div>

        {/* Your Position */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-xs uppercase text-gray-600 mb-1">Your Position</p>
          <p className="text-3xl font-bold text-indigo-600">
            {queuePosition ? `#${queuePosition}` : '—'}
          </p>
        </div>

        {/* Wait Time */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-xs uppercase text-gray-600 mb-1">Est. Wait</p>
          <p className="text-3xl font-bold text-green-600">
            {estimatedWait ? `${estimatedWait}m` : '—'}
          </p>
        </div>

        {/* Report By */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-xs uppercase text-gray-600 mb-1">Report By</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatTime(estimatedReportingTime)}
          </p>
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-indigo-600">
        <p className="text-lg font-semibold text-gray-900">{getQueueStatus()}</p>
        {lastUpdate && (
          <p className="text-xs text-gray-500 mt-1">
            Updated {new Date(lastUpdate).toLocaleTimeString('en-IN')}
          </p>
        )}
      </div>

      {/* Info Text */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p>✓ Your position updates automatically every time a patient is called</p>
        <p>✓ Estimated wait time adjusts based on actual consultation durations</p>
        <p>✓ Please keep this page open to receive real-time notifications</p>
      </div>
    </Card>
  );
};

export default LiveQueueDisplay;
