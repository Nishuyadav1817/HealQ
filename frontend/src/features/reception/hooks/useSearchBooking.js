import { useQuery } from '@tanstack/react-query';
import { searchByBookingNumber } from '../services/reception.api';

/**
 * On-demand, not automatic — only fires once a receptionist actually
 * submits a booking number (`enabled: !!term`), so simply typing into the
 * search box never spams the API. The submitted term is kept as its own
 * piece of state by the caller (see SearchBookingCard) separate from the
 * live input value, so the query only re-runs on an explicit search.
 */
export const useSearchBooking = (term) =>
  useQuery({
    queryKey: ['searchBooking', term],
    queryFn: () => searchByBookingNumber(term),
    select: (res) => res.data.data.appointment,
    enabled: !!term,
    retry: false,
  });
