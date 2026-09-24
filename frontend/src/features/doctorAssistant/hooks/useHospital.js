import { useQuery } from '@tanstack/react-query';
import { getHospitalById } from '../services/doctorAssistant.api';

/**
 * Resolves the doctor assistant's own hospital (`useAuth().user.hospital`,
 * an id) into its full record so the header can show the hospital's
 * actual name — never hard-coded. Same approach as Reception's
 * useHospital hook; a hospital's own details essentially never change
 * during a shift, hence the long staleTime.
 */
export const useHospital = (hospitalId) =>
  useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: () => getHospitalById(hospitalId),
    select: (res) => res.data.data.hospital,
    enabled: !!hospitalId,
    staleTime: 10 * 60 * 1000,
  });

export default useHospital;
