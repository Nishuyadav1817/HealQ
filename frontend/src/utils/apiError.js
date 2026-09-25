/**
 * Every mutation/error-handling spot in the app used to do:
 *
 *   err.response?.data?.message || 'Something went wrong.'
 *
 * ...which only ever shows the generic top-level message (e.g.
 * "Validation failed"). The API actually sends the SPECIFIC per-field
 * reason(s) in `data.errors` (an array — see ApiError / error.middleware
 * on the backend) whenever the failure came from Joi validation, but
 * nothing ever read it. This single helper is now used everywhere
 * instead, so real validation reasons ("Phone number must be...",
 * "Appointment date cannot be in the past", etc.) actually reach the
 * user instead of a vague "Validation failed"/"Something went wrong".
 */
export const getApiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join(' ');
  }
  return data?.message || fallback;
};
