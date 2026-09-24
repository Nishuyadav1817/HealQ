import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Field from '../components/ui/PField';
import { EmptyState, ErrorNotice, CardSkeleton } from '../components/ui/PStateNotice';
import { useCities } from '../hooks/useLookups';
import CityCard from '../components/CityCard';
import BookingSteps from '../components/BookingSteps';
import { ROUTES } from '../../../constants/routePaths';

const ChooseCityPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: cities, isLoading, isError } = useCities(search);

  const handleSelect = (city) => {
    navigate(`${ROUTES.PATIENT.CHOOSE_HOSPITAL}?cityId=${city._id}&cityName=${encodeURIComponent(city.name)}`);
  };

  return (
    <div>
      <BookingSteps current={1} />
      <h1 className="font-display text-2xl font-semibold text-ink">Choose your city</h1>
      <p className="mt-1 text-sm text-ink-muted">We'll show you hospitals available in that city.</p>

      <div className="mt-4 max-w-sm">
        <Field
          label="Search city"
          placeholder="e.g. Bengaluru"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} lines={1} />
            ))}
          </div>
        )}
        {isError && <ErrorNotice message="Couldn't load cities right now." />}
        {!isLoading && !isError && cities?.length === 0 && (
          <EmptyState title="No cities found" description="Try a different search term." />
        )}
        {!isLoading && !isError && cities?.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <CityCard key={city._id} city={city} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseCityPage;
