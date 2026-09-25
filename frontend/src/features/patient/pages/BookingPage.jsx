import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Field from '../components/ui/PField';
import Button from '../components/ui/PButton';
import Card from '../components/ui/PCard';
import { Spinner, ErrorNotice } from '../components/ui/PStateNotice';
import { useDoctor } from '../hooks/useLookups';
import { useBookAppointment } from '../hooks/useAppointments';
import BookingSteps from '../components/BookingSteps';
import { ROUTES } from '../../../constants/routePaths';
import { getApiErrorMessage } from '../../../utils/apiError';

const todayISO = () => new Date().toISOString().slice(0, 10);

const BookingPage = () => {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');
  const departmentId = searchParams.get('departmentId');
  const navigate = useNavigate();

  const { data: doctor, isLoading, isError } = useDoctor(doctorId);
  const bookMutation = useBookAppointment();

  const [form, setForm] = useState({ appointmentDate: todayISO(), reasonForVisit: '', symptoms: '' });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!hospitalId || !departmentId) {
      setFormError('Missing hospital/department context — please restart the booking flow.');
      return;
    }

    try {
      const res = await bookMutation.mutateAsync({
        hospital: hospitalId,
        department: departmentId,
        doctor: doctorId,
        appointmentDate: form.appointmentDate,
        reasonForVisit: form.reasonForVisit,
        symptoms: form.symptoms
          ? form.symptoms.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });

      const result = res.data.data;
      navigate(`${ROUTES.PATIENT.BOOKING_SUCCESS}/${result.appointment._id}`, {
        replace: true,
        state: result,
      });
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Booking failed. Please try a different date.'));
    }
  };

  if (isLoading) return <Spinner label="Loading doctor details…" />;
  if (isError || !doctor) return <ErrorNotice message="Couldn't load this doctor's details." />;

  return (
    <div>
      <BookingSteps current={4} />
      <h1 className="font-serif text-2xl font-semibold text-ink">Confirm your appointment</h1>

      <Card className="mt-4">
        <p className="font-serif text-lg font-semibold text-ink">Dr. {doctor.user?.fullName}</p>
        <p className="text-sm text-ink-muted">{doctor.specialization}</p>
        {doctor.hospital?.name && (
          <p className="mt-2 text-sm font-medium text-ink">{doctor.hospital.name}</p>
        )}
        {doctor.hospital?.address?.line1 && (
          <p className="text-sm text-ink-muted">
            {doctor.hospital.address.line1}
            {doctor.hospital.address.line2 ? `, ${doctor.hospital.address.line2}` : ''}
            {doctor.hospital.address.pincode ? ` – ${doctor.hospital.address.pincode}` : ''}
          </p>
        )}
        {doctor.hospital?.contact?.phone && (
          <p className="text-xs text-ink-subtle">Hospital contact: {doctor.hospital.contact.phone}</p>
        )}
        <p className="mt-1 text-xs text-ink-subtle">₹{doctor.consultationFee} consultation fee</p>
      </Card>

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
        <Field
          label="Appointment date"
          type="date"
          name="appointmentDate"
          min={todayISO()}
          value={form.appointmentDate}
          onChange={handleChange}
          required
        />
        <Field
          label="Reason for visit (optional)"
          as="textarea"
          name="reasonForVisit"
          placeholder="Briefly describe why you're visiting"
          value={form.reasonForVisit}
          onChange={handleChange}
        />
        <Field
          label="Symptoms (optional, comma separated)"
          name="symptoms"
          placeholder="e.g. fever, headache"
          value={form.symptoms}
          onChange={handleChange}
        />

        {formError && <p className="text-sm font-medium text-danger">{formError}</p>}

        <Button type="submit" isLoading={bookMutation.isPending} className="w-full">
          Confirm booking
        </Button>
      </form>
    </div>
  );
};

export default BookingPage;
