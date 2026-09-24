import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Field from '../components/ui/PField';
import { EmptyState, ErrorNotice, CardSkeleton } from '../components/ui/PStateNotice';
import { useHospitals } from '../hooks/useLookups';
import HospitalCard from '../components/HospitalCard';
import BookingSteps from '../components/BookingSteps';
import BookingContextBar from '../components/BookingContextBar';
import { ROUTES } from '../../../constants/routePaths';

const ChooseHospitalPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get('cityId');
  const cityName = searchParams.get('cityName');
  const [search, setSearch] = useState('');

  const { data: hospitals, isLoading, isError } = useHospitals(cityId, search);

  const handleSelect = (hospital) => {
    navigate(
      `${ROUTES.PATIENT.DOCTORS}?hospitalId=${hospital._id}&hospitalName=${encodeURIComponent(hospital.name)}`
    );
  };

  if (!cityId) {
    return (
      <EmptyState
        title="Pick a city first"
        description="We need to know which city to search hospitals in."
        action={
          <Link to={ROUTES.PATIENT.CHOOSE_CITY} className="text-sm font-medium text-primary-600">
            Choose a city →
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <BookingSteps current={2} />
      <BookingContextBar items={[{ label: 'City', value: cityName }]} />
      <h1 className="font-display text-2xl font-semibold text-ink">Hospitals in {cityName || 'your city'}</h1>
      <p className="mt-1 text-sm text-ink-muted">Pick the hospital you'd like to visit.</p>

      <div className="mt-4 max-w-sm">
        <Field
          label="Search hospital"
          placeholder="e.g. City Care Hospital"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} lines={2} />
            ))}
          </div>
        )}
        {isError && <ErrorNotice message="Couldn't load hospitals right now." />}
        {!isLoading && !isError && hospitals?.length === 0 && (
          <EmptyState title="No hospitals found" description="Try a different search term or city." />
        )}
        {!isLoading && !isError && hospitals?.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {hospitals.map((hospital) => (
              <HospitalCard key={hospital._id} hospital={hospital} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseHospitalPage;
