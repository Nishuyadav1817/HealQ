import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Spinner, ErrorNotice, EmptyState } from '../../../components/ui/StateNotice';
import { useHospitalDoctors } from '../hooks/useHospitalDoctors';
import { useQueue } from '../hooks/useQueue';
import useQueueLiveUpdates from '../hooks/useQueueLiveUpdates';
import QueueControls from '../components/QueueControls';
import LiveIndicator from '../components/LiveIndicator';
import CurrentPatientCard from '../components/CurrentPatientCard';
import NextPatientCard from '../components/NextPatientCard';
import QueueList from '../components/QueueList';

const todayISO = () => new Date().toISOString().slice(0, 10);

const DoctorQueuePage = () => {
  const { user } = useAuth();
  const { data: doctors, isLoading: isLoadingDoctors } = useHospitalDoctors(user?.hospital);

  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayISO());

  // Default to the first doctor once the list loads, so the board isn't
  // just an empty dropdown the assistant has to act on before seeing
  // anything.
  useEffect(() => {
    if (!doctorId && doctors?.length) {
      setDoctorId(doctors[0]._id);
    }
  }, [doctors, doctorId]);

  const { data: queueView, isLoading, isError } = useQueue({ doctor: doctorId, date });
  const { isConnected } = useQueueLiveUpdates(doctorId, date);

  const waitingList = queueView?.waitingList ?? [];
  const [next, ...rest] = waitingList;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Doctor Assistant Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage the live queue for a doctor's clinic day.</p>
        </div>
        {doctorId && <LiveIndicator isConnected={isConnected} />}
      </div>

      <div className="mt-4">
        <QueueControls
          doctors={doctors}
          doctorId={doctorId}
          onDoctorChange={(e) => setDoctorId(e.target.value)}
          date={date}
          onDateChange={(e) => setDate(e.target.value)}
          queueStatus={queueView?.queueStatus}
          averageConsultationMinutes={queueView?.averageConsultationMinutes}
        />
      </div>

      {isLoadingDoctors && <Spinner label="Loading your doctors…" />}

      {!isLoadingDoctors && doctors?.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No doctors found" description="Your hospital has no active doctors yet." />
        </div>
      )}

      {doctorId && (
        <>
          {isLoading && <Spinner label="Loading queue…" />}
          {isError && <ErrorNotice message="Couldn't load the queue right now." />}

          {!isLoading && !isError && (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <CurrentPatientCard entry={queueView?.currentPatient} />
                <NextPatientCard
                  next={next}
                  hasCurrentPatient={!!queueView?.currentPatient}
                  doctorId={doctorId}
                  date={date}
                  queueStatus={queueView?.queueStatus}
                />
              </div>

              <div className="mt-4">
                <QueueList entries={rest} totalWaiting={waitingList.length} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorQueuePage;
