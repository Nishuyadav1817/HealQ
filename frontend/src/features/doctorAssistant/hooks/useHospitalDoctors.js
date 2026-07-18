import { useQuery } from '@tanstack/react-query';
import { getHospitalDoctors } from '../services/doctorAssistant.api';

/** Lets the assistant pick which doctor's queue to manage — Doctor
 * Assistant accounts aren't pinned to a single doctor, so this dropdown
 * is the entry point into the rest of the dashboard. Scoped to the
 * assistant's own hospital (see useAuth().user.hospital at the call
 * site) since that's the only hospital they're authorized to act on. */
export const useHospitalDoctors = (hospitalId) =>
  useQuery({
    queryKey: ['hospitalDoctors', hospitalId],
    queryFn: () => getHospitalDoctors(hospitalId),
    select: (res) => res.data.data.doctors,
    enabled: !!hospitalId,
    staleTime: 5 * 60 * 1000,
  });
