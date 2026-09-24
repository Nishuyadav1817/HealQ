import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Field from '../components/ui/PField';
import { EmptyState, ErrorNotice, CardSkeleton } from '../components/ui/PStateNotice';
import { useDepartments, useDoctors } from '../hooks/useLookups';
import DoctorCard from '../components/DoctorCard';
import BookingSteps from '../components/BookingSteps';
import BookingContextBar from '../components/BookingContextBar';
import { ROUTES } from '../../../constants/routePaths';

const DoctorListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');
  const hospitalName = searchParams.get('hospitalName');

  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');

  const { data: departments } = useDepartments(hospitalId);
  const { data: doctors, isLoading, isError } = useDoctors(hospitalId, { department, search });

  const handleBook = (doctor) => {
    const departmentId = doctor.department?._id ?? doctor.department;
    navigate(
      `${ROUTES.PATIENT.BOOKING}/${doctor._id}?hospitalId=${hospitalId}&hospitalName=${encodeURIComponent(
        hospitalName || ''
      )}&departmentId=${departmentId}`
    );
  };

  if (!hospitalId) {
    return (
      <EmptyState
        title="Pick a hospital first"
        description="We need to know which hospital to search doctors in."
        action={
          <Link to={ROUTES.PATIENT.CHOOSE_CITY} className="text-sm font-medium text-primary-600">
            Start over →
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <BookingSteps current={3} />
      <BookingContextBar items={[{ label: 'Hospital', value: hospitalName }]} />
      <h1 className="font-display text-2xl font-semibold text-ink">
        Doctors at {hospitalName || 'this hospital'}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">Pick a doctor to see availability and book a slot.</p>

      <div className="mt-4 flex flex-wrap gap-4">
        <Field
          className="w-56"
          label="Department"
          as="select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All departments</option>
          {departments?.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </Field>
        <Field
          className="w-64"
          label="Search by specialization"
          placeholder="e.g. Cardiology"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={2} />)}
        {isError && <ErrorNotice message="Couldn't load doctors right now." />}
        {!isLoading && !isError && doctors?.length === 0 && (
          <EmptyState title="No doctors found" description="Try a different department or search term." />
        )}
        {!isLoading &&
          !isError &&
          doctors?.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} onBook={handleBook} />)}
      </div>
    </div>
  );
};

export default DoctorListPage;
