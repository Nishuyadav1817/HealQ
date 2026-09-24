import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useHospitalDoctors } from '../hooks/useHospitalDoctors';

const DoctorSelectionContext = createContext(undefined);

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Which doctor's queue the assistant is currently managing, and on which
 * date. Previously this lived as local state inside DoctorQueuePage
 * alone; it's lifted here so DoctorTopNav can show "Dr. X · Department"
 * next to the hospital name in the header, without a second copy of the
 * doctor list or a second "pick the first doctor by default" effect that
 * could drift out of sync with the board itself. Doctor Assistant
 * accounts aren't pinned to a single doctor (see useHospitalDoctors), so
 * this is a runtime selection, not a static field on the logged-in user.
 */
export const DoctorSelectionProvider = ({ children }) => {
  const { user } = useAuth();
  const { data: doctors, isLoading: isLoadingDoctors } = useHospitalDoctors(user?.hospital);

  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayISO());

  // Default to the first doctor once the list loads, so neither the
  // header nor the board is just an empty state the assistant has to act
  // on before seeing anything — same behavior DoctorQueuePage had before.
  useEffect(() => {
    if (!doctorId && doctors?.length) {
      setDoctorId(doctors[0]._id);
    }
  }, [doctors, doctorId]);

  const doctor = useMemo(() => doctors?.find((d) => d._id === doctorId) ?? null, [doctors, doctorId]);

  const value = useMemo(
    () => ({ doctors, isLoadingDoctors, doctorId, setDoctorId, date, setDate, doctor }),
    [doctors, isLoadingDoctors, doctorId, date, doctor]
  );

  return <DoctorSelectionContext.Provider value={value}>{children}</DoctorSelectionContext.Provider>;
};

export const useDoctorSelection = () => {
  const ctx = useContext(DoctorSelectionContext);
  if (ctx === undefined) {
    throw new Error('useDoctorSelection must be used within a DoctorSelectionProvider.');
  }
  return ctx;
};
