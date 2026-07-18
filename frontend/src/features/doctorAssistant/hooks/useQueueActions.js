import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  callNextPatient,
  startConsultation,
  completeConsultation,
  skipPatient,
  pauseQueue,
  resumeQueue,
  setAverageConsultationMinutes,
} from '../services/doctorAssistant.api';

/** Every action invalidates the whole `doctorQueue` cache — React Query
 * v5 treats a queryKey prefix as a match, so this refreshes whichever
 * doctor/date variant is currently on screen without needing to know its
 * exact key here. */
const useQueueAction = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorQueue'] });
    },
  });
};

export const useCallNextPatient = () =>
  useQueueAction(({ doctor, date }) => callNextPatient({ doctor, date }));

export const useStartConsultation = () =>
  useQueueAction(({ appointmentId }) => startConsultation(appointmentId));

export const useCompleteConsultation = () =>
  useQueueAction(({ appointmentId }) => completeConsultation(appointmentId));

export const useSkipPatient = () => useQueueAction(({ appointmentId }) => skipPatient(appointmentId));

export const usePauseQueue = () => useQueueAction(({ doctor, date }) => pauseQueue({ doctor, date }));

export const useResumeQueue = () => useQueueAction(({ doctor, date }) => resumeQueue({ doctor, date }));

export const useSetAverageConsultationMinutes = () =>
  useQueueAction(({ doctor, date, averageConsultationMinutes }) =>
    setAverageConsultationMinutes({ doctor, date, averageConsultationMinutes })
  );
