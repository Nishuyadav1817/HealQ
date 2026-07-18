import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStaff,
  createReceptionist,
  createDoctorAssistant,
  updateStaff,
  deactivateStaff,
} from '../services/admin.api';

export const useAdminStaff = (params) =>
  useQuery({
    queryKey: ['adminStaff', params],
    queryFn: () => getStaff(params),
    select: (res) => res.data.data,
    placeholderData: (previous) => previous,
  });

const useStaffMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStaff'] });
    },
  });
};

export const useCreateReceptionist = () =>
  useStaffMutation((payload) => createReceptionist(payload));

export const useCreateDoctorAssistant = () =>
  useStaffMutation((payload) => createDoctorAssistant(payload));

export const useUpdateStaff = () =>
  useStaffMutation(({ id, payload }) => updateStaff(id, payload));

export const useDeactivateStaff = () => useStaffMutation((id) => deactivateStaff(id));
