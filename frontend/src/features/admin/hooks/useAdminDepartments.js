import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../services/admin.api';

export const useAdminDepartments = (params) =>
  useQuery({
    queryKey: ['adminDepartments', params],
    queryFn: () => getDepartments(params),
    select: (res) => res.data.data,
    placeholderData: (previous) => previous,
  });

/** Every mutation invalidates both the paginated admin-page list cache
 * AND the hospital-scoped lookup used by the Doctor create form's
 * Department dropdown, so a newly-added department shows up there
 * immediately without a refresh. */
const useDepartmentMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
      queryClient.invalidateQueries({ queryKey: ['adminDepartmentsLookup'] });
    },
  });
};

export const useCreateDepartment = () =>
  useDepartmentMutation((payload) => createDepartment(payload));

export const useUpdateDepartment = () =>
  useDepartmentMutation(({ id, payload }) => updateDepartment(id, payload));

export const useDeleteDepartment = () => useDepartmentMutation((id) => deleteDepartment(id));
