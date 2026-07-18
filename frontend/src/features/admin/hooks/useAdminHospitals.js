import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
} from '../services/admin.api';

export const useAdminHospitals = (params) =>
  useQuery({
    queryKey: ['adminHospitals', params],
    queryFn: () => getHospitals(params),
    select: (res) => res.data.data,
    placeholderData: (previous) => previous,
  });

/** Every mutation invalidates the whole `adminHospitals` cache — same
 * "invalidate by key prefix" pattern used in doctorAssistant's
 * useQueueActions, so create/edit/deactivate all refresh whichever
 * page/filter combination is currently on screen. */
const useHospitalMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHospitals'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardSummary'] });
    },
  });
};

export const useCreateHospital = () => useHospitalMutation((payload) => createHospital(payload));

export const useUpdateHospital = () =>
  useHospitalMutation(({ id, payload }) => updateHospital(id, payload));

export const useDeleteHospital = () => useHospitalMutation((id) => deleteHospital(id));
