import { useQuery } from '@tanstack/react-query';
import { getCities, getDepartments, getDoctors } from '../services/admin.api';

/** Populates the City dropdown on the Create Hospital form. */
export const useCitiesLookup = () =>
  useQuery({
    queryKey: ['adminCitiesLookup'],
    queryFn: () => getCities({ limit: 100, sort: 'name' }),
    select: (res) => res.data.data.cities,
    staleTime: 5 * 60 * 1000,
  });

/** Populates the Department dropdown on the Create/Assign Doctor form —
 * scoped to whichever hospital is currently selected, since a department
 * always belongs to exactly one hospital. */
export const useDepartmentsLookup = (hospitalId) =>
  useQuery({
    queryKey: ['adminDepartmentsLookup', hospitalId],
    queryFn: () => getDepartments({ hospital: hospitalId, limit: 100, sort: 'name' }),
    select: (res) => res.data.data.departments,
    enabled: !!hospitalId,
    staleTime: 5 * 60 * 1000,
  });

/** Populates the "Assigned doctor" dropdown on the Create Doctor
 * Assistant form — scoped to whichever hospital is currently selected,
 * since an assistant may only be assigned to a doctor within that same
 * hospital (enforced again server-side in staff.service.js). */
export const useDoctorsLookup = (hospitalId) =>
  useQuery({
    queryKey: ['adminDoctorsLookup', hospitalId],
    queryFn: () => getDoctors({ hospital: hospitalId, limit: 100, isActive: 'true' }),
    select: (res) => res.data.data.doctors,
    enabled: !!hospitalId,
    staleTime: 5 * 60 * 1000,
  });
