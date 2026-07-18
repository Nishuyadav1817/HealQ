import { useQuery } from '@tanstack/react-query';
import { getAdminAppointments, getAdminAppointmentById } from '../services/admin.api';

export const useAdminAppointments = (params) =>
  useQuery({
    queryKey: ['adminAppointments', params],
    queryFn: () => getAdminAppointments(params),
    select: (res) => res.data.data,
    placeholderData: (previous) => previous,
  });

export const useAdminAppointmentDetail = (id) =>
  useQuery({
    queryKey: ['adminAppointment', id],
    queryFn: () => getAdminAppointmentById(id),
    select: (res) => res.data.data.appointment,
    enabled: !!id,
  });
