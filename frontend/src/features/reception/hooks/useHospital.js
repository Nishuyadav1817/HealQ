import { useQuery } from '@tanstack/react-query';
import { getHospitalById } from '../services/reception.api';

/**
 * Resolves the reception user's own hospital (`useAuth().user.hospital`,
 * an id) into its full record so the header/dashboard can show the
 * hospital's actual name — never hard-coded. A hospital's own details
 * essentially never change during a shift, hence the long `staleTime`.
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
