import { Spinner, ErrorNotice, EmptyState } from '../../../components/ui/StateNotice';
import { useDoctorSelection } from '../context/DoctorSelectionContext';
import { useQueue } from '../hooks/useQueue';
import useQueueLiveUpdates from '../hooks/useQueueLiveUpdates';
import QueueControls from '../components/QueueControls';
import LiveIndicator from '../components/LiveIndicator';
import CurrentPatientCard from '../components/CurrentPatientCard';
import NextPatientCard from '../components/NextPatientCard';
import TodayStats from '../components/TodayStats';
import QueueList from '../components/QueueList';

/**
 * Doctor Assistant's live queue board. Doctor/date selection now lives
 * in DoctorSelectionContext (shared with the header, see DoctorTopNav)
 * rather than local state — everything below still reads exactly the
 * same useQueue/useQueueLiveUpdates data it always did.
 *
 * Layout follows the clinical priority of the workflow, top to bottom:
 * the patient in front of the doctor right now, who's coming up next,
 * a quick read on the shape of the day, then the full remaining queue.
 */
const DoctorQueuePage = () => {
  const { doctors, isLoadingDoctors, doctorId, setDoctorId, date, setDate, doctor } = useDoctorSelection();

  const { data: queueView, isLoading, isError } = useQueue({ doctor: doctorId, date });
  const { isConnected } = useQueueLiveUpdates(doctorId, date);

  const waitingList = queueView?.waitingList ?? [];
  const [next, ...rest] = waitingList;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {doctor ? `Dr. ${doctor.user?.fullName}'s Queue` : 'Doctor Assistant Dashboard'}
          </h1>
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
              {/* CURRENT PATIENT — highest priority, full width. */}
              <div className="mt-6">
                <CurrentPatientCard entry={queueView?.currentPatient} />
              </div>

              {/* NEXT PATIENT — who's coming up. */}
              <div className="mt-4">
                <NextPatientCard
                  next={next}
                  hasCurrentPatient={!!queueView?.currentPatient}
                  doctorId={doctorId}
                  date={date}
                  queueStatus={queueView?.queueStatus}
                />
              </div>

              {/* TODAY'S STATISTICS */}
              <div className="mt-6">
                <TodayStats queueView={queueView} waitingList={waitingList} />
              </div>

              {/* LIVE QUEUE — everyone else waiting. */}
              <div className="mt-6">
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
