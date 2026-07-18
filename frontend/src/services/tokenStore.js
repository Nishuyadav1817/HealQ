/**
 * Holds the access token in memory ONLY — never localStorage/sessionStorage.
 * This mirrors the backend's own security posture: the refresh token lives
 * in an httpOnly cookie (inaccessible to JS, safe from XSS); the access
 * token here is equally deliberate — a memory-only value vanishes on tab
 * close/refresh, forcing a silent re-authentication via that httpOnly
 * cookie (see AuthContext's bootstrap effect) rather than sitting
 * somewhere an XSS payload could read it.
 *
 * A standalone module (not React state) so apiClient.js can read/write it
 * without importing AuthContext — that import would go the other way
 * (AuthContext -> apiClient), and a two-way import between them would be
 * a circular dependency.
 */
let accessToken = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};
