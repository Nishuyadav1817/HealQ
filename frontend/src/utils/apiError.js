/**
 * Extract user-friendly error messages from API responses
 */
export const getApiErrorMessage = (error, defaultMessage = 'Something went wrong') => {
  if (!error) return defaultMessage;

  // Axios error with response data
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Generic axios error
  if (error.response?.statusText) {
    return error.response.statusText;
  }

  // String error message
  if (typeof error === 'string') {
    return error;
  }

  // Error object with message
  if (error.message) {
    return error.message;
  }

  return defaultMessage;
};

export default {
  getApiErrorMessage,
};
