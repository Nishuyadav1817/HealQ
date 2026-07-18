import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCities, createCity, updateCity, deleteCity } from '../services/admin.api';

export const useAdminCities = (params) =>
  useQuery({
    queryKey: ['adminCities', params],
    queryFn: () => getCities(params),
    select: (res) => res.data.data,
    placeholderData: (previous) => previous,
  });

/** Every mutation invalidates both the paginated admin-page list cache
 * AND the lookup used by the Hospital create form's City dropdown, so a
 * newly-added city shows up there immediately without a refresh. */
const useCityMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCities'] });
      queryClient.invalidateQueries({ queryKey: ['adminCitiesLookup'] });
    },
  });
};

export const useCreateCity = () => useCityMutation((payload) => createCity(payload));

export const useUpdateCity = () =>
  useCityMutation(({ id, payload }) => updateCity(id, payload));

export const useDeleteCity = () => useCityMutation((id) => deleteCity(id));
