import { useQuery } from '@tanstack/react-query';
import { getAdminPatients, getAdminPatientById } from '../services/admin.api';

export const useAdminPatients = (params) =>
  useQuery({
    queryKey: ['adminPatients', params],
    queryFn: () => getAdminPatients(params),
    select: (res) => res.data.data,
    placeholderData: (previous) => previous, // keeps the table visible while paging/filtering
  });

export const useAdminPatientDetail = (id) =>
  useQuery({
    queryKey: ['adminPatient', id],
    queryFn: () => getAdminPatientById(id),
    select: (res) => res.data.data,
    enabled: !!id,
  });
