import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // sends the httpOnly refresh-token cookie
  timeout: 15000,
});

// A separate, interceptor-free instance for the refresh call itself.
// Using `apiClient` here would let a 401 FROM /auth/refresh-token
// re-trigger apiClient's own response interceptor below — exactly the
// infinite loop this whole mechanism exists to prevent.
const refreshClient = axios.create({ baseURL, withCredentials: true });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Coordinates concurrent 401s. If several requests fail at once because
 * the access token just expired, exactly ONE refresh call fires — every
 * other failing request awaits that SAME in-flight promise instead of
 * each independently calling /auth/refresh-token (which would each try
 * to rotate the same refresh token; only the first would succeed, and
 * the rest would incorrectly log the user out). This is the frontend
 * mirror of the "avoid duplicate events" discipline used throughout the
 * backend's socket layer, applied here to network requests instead.
 */
let refreshPromise = null;

const performRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh-token')
      .then(({ data }) => {
        const token = data?.data?.accessToken ?? null;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh-token'].some((path) =>
      config?.url?.includes(path)
    );

    if (response?.status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true; // exactly one retry attempt per request — never a retry loop

      try {
        const token = await performRefresh();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return apiClient(config);
        }
      } catch {
        // Refresh itself failed (refresh token expired/invalid/reused) —
        // the session is genuinely over. Decoupled from AuthContext via a
        // DOM event, the same pattern tokenStore.js uses, so this file
        // never needs to import React context.
        clearAccessToken();
        window.dispatchEvent(new Event('auth:logout'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
