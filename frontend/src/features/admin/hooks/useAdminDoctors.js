import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../services/admin.api';

export const useAdminDoctors = (params) =>
  useQuery({
    queryKey: ['adminDoctors', params],
    queryFn: () => getDoctors(params),
    select: (res) => res.data.data,
    placeholderData: (previous) => previous,
  });

const useDoctorMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardSummary'] });
    },
  });
};

export const useCreateDoctor = () => useDoctorMutation((payload) => createDoctor(payload));

export const useUpdateDoctor = () =>
  useDoctorMutation(({ id, payload }) => updateDoctor(id, payload));

export const useDeleteDoctor = () => useDoctorMutation((id) => deleteDoctor(id));
