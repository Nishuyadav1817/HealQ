import { useQuery } from '@tanstack/react-query';
import {
  getCities,
  getHospitals,
  getDepartments,
  getDoctors,
  getDoctorById,
} from '../services/patient.api';

/**
 * One small hook per lookup resource, all following the same shape:
 * enabled only once its own required filter (e.g. a chosen city) is
 * present, so a page never fires a request for data it can't use yet.
 */

export const useCities = (search = '') =>
  useQuery({
    queryKey: ['cities', search],
    queryFn: () => getCities(search ? { search } : {}),
    select: (res) => res.data.data.cities,
    staleTime: 5 * 60 * 1000, // cities barely change — safe to cache a while
  });

export const useHospitals = (cityId, search = '') =>
  useQuery({
    queryKey: ['hospitals', cityId, search],
    queryFn: () => getHospitals({ city: cityId, ...(search ? { search } : {}) }),
    select: (res) => res.data.data.hospitals,
    enabled: !!cityId,
  });

export const useDepartments = (hospitalId) =>
  useQuery({
    queryKey: ['departments', hospitalId],
    queryFn: () => getDepartments({ hospital: hospitalId }),
    select: (res) => res.data.data.departments,
    enabled: !!hospitalId,
  });

export const useDoctors = (hospitalId, { department, search } = {}) =>
  useQuery({
    queryKey: ['doctors', hospitalId, department, search],
    queryFn: () =>
      getDoctors({
        hospital: hospitalId,
        ...(department ? { department } : {}),
        ...(search ? { search } : {}),
      }),
    select: (res) => res.data.data.doctors,
    enabled: !!hospitalId,
  });

export const useDoctor = (doctorId) =>
  useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => getDoctorById(doctorId),
    select: (res) => res.data.data.doctor,
    enabled: !!doctorId,
  });
