import axios from 'axios';
import * as tokenStore from './tokenStore';

/**
 * HTTP Client for UpcharGanga API
 *
 * Features:
 * - Automatically adds Authorization header with access token
 * - Handles 401 responses by refreshing token and retrying
 * - Clears auth on permanent failure (invalid refresh token)
 * - Configurable base URL via environment variables
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important: includes httpOnly cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to prevent duplicate refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

/**
 * Request Interceptor: Add Authorization header
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Handle 401 and refresh token
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 responses
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loops on logout endpoint
    if (originalRequest.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    // Prevent duplicate refresh requests
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark that we're refreshing
    isRefreshing = true;

    try {
      // Attempt to refresh token using httpOnly cookie
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
        withCredentials: true,
        timeout: 5000,
      });

      const { data } = response.data;
      const newAccessToken = data.accessToken;

      // Update token store with new token
      tokenStore.setAccessToken(newAccessToken);

      // Update original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Process any queued requests
      processQueue(null, newAccessToken);

      // Retry original request
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed - session is invalid
      console.error('[apiClient] Token refresh failed:', refreshError);

      // Clear all authentication state
      tokenStore.clearAccessToken();

      // Dispatch logout event for AuthContext to catch
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason: 'session_expired' },
      }));

      // Process failed queue
      processQueue(refreshError, null);

      // Redirect to login will be handled by AuthContext listening to auth:logout
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
  }
);

export default apiClient;
