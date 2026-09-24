import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Spinner, ErrorNotice } from '../components/ui/PStateNotice';
import TokenReceipt from '../components/TokenReceipt';
import { useAppointment } from '../hooks/useAppointments';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../../../context/AuthContext';

/** Reads the booking result out of navigation state (set right after
 * useBookAppointment succeeds) — falls back to a REST fetch if the page
 * was reloaded and that state was lost, so a refresh never breaks it. */
const BookingSuccessPage = () => {
  const { appointmentId } = useParams();
  const location = useLocation();
  const bookingResult = location.state;
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const shouldFetch = !bookingResult;
  const { data: fetchedAppointment, isLoading, isError } = useAppointment(shouldFetch ? appointmentId : null);

  const appointment = bookingResult?.appointment || fetchedAppointment;
  const bookingNumber = bookingResult?.bookingNumber || appointment?.bookingNumber;
  const queueNumber = bookingResult?.queueNumber ?? appointment?.tokenNumber;
  const queueStatus = bookingResult?.queueStatus;

  // Only push a "just booked" notice for a fresh booking (i.e. we
  // arrived with navigation state), never on a reload of this page —
  // a reload shouldn't re-announce something that already happened.
  useEffect(() => {
    if (!bookingResult?.appointment) return;
    addNotification({
      title: 'Appointment booked',
      description: `Token #${queueNumber} · ${bookingResult.appointment.hospital?.name || ''}`.trim(),
      tone: 'success',
      appointmentId: bookingResult.appointment._id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shouldFetch && isLoading) return <Spinner label="Loading your booking…" />;
  if (shouldFetch && (isError || !appointment)) {
    return <ErrorNotice message="Couldn't load this booking. Check My Appointments instead." />;
  }

  return (
    <TokenReceipt
      appointment={appointment}
      bookingNumber={bookingNumber}
      queueNumber={queueNumber}
      queueStatus={queueStatus}
      patientName={appointment?.patient?.fullName || user?.fullName}
    />
  );
};

export default BookingSuccessPage;
