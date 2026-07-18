import { useState } from 'react';
import Field from '../../../components/ui/Field';
import Button from '../../../components/ui/Button';
import { Spinner, EmptyState, ErrorNotice } from '../../../components/ui/StateNotice';
import { useSearchBooking } from '../hooks/useSearchBooking';
import ReceptionAppointmentCard from '../components/ReceptionAppointmentCard';

const SearchBookingPage = () => {
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');

  const { data: appointment, isLoading, isError, isFetched } = useSearchBooking(term);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTerm(input.trim());
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Search Booking</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Look up any appointment by its booking reference — not limited to today.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex max-w-md items-end gap-3">
        <Field
          className="flex-1"
          label="Booking number"
          placeholder="e.g. SHQ-20260710-A3F9C-003"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-6 max-w-2xl">
        {isLoading && <Spinner label="Searching…" />}
        {isError && <ErrorNotice message="No appointment found with that booking number." />}
        {!isLoading && !isError && isFetched && !appointment && (
          <EmptyState title="Nothing found" description="Double-check the booking reference and try again." />
        )}
        {!isLoading && !isError && appointment && <ReceptionAppointmentCard appointment={appointment} />}
        {!term && (
          <EmptyState
            title="Search for a booking"
            description="Enter a booking reference above to find and act on it."
          />
        )}
      </div>
    </div>
  );
};

export default SearchBookingPage;
