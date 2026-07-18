import apiClient from '../../../services/apiClient';

/**
 * Thin wrappers around the auth endpoints — no state, no side effects
 * beyond the HTTP call itself. AuthContext owns what happens WITH the
 * response (updating tokenStore, React state); this file only owns HOW
 * to ask the API for it. Keeping that split means these functions stay
 * trivially reusable (e.g. from a React Query mutation later) without
 * dragging context state along.
 */

export const loginRequest = (credentials) => apiClient.post('/auth/login', credentials);

export const registerRequest = (payload) => apiClient.post('/auth/register', payload);

export const logoutRequest = () => apiClient.post('/auth/logout');

export const refreshTokenRequest = () => apiClient.post('/auth/refresh-token');

export const getCurrentUserRequest = () => apiClient.get('/auth/me');
