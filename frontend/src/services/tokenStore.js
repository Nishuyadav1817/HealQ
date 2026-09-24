/**
 * Token Persistence Layer
 *
 * Manages access token storage and retrieval securely.
 * - Stores in-memory for XSS protection (not localStorage)
 * - Uses sessionStorage as fallback for page refresh
 * - Refresh token stays in httpOnly cookie (browser manages, we don't touch)
 * - Tracks expiry time for preemptive refresh
 */

let accessToken = null;
let tokenExpiryTime = null;

const SESSION_STORAGE_KEY = 'uc_access_token_temp';
const EXPIRY_STORAGE_KEY = 'uc_token_expiry_temp';

/**
 * Set access token and calculate expiry
 * @param {string} token - JWT access token
 * @param {number} expiresIn - Seconds until expiry (optional, default 15 min)
 */
export const setAccessToken = (token, expiresIn = 900) => {
  accessToken = token;

  // Calculate expiry time: now + expiresIn seconds
  tokenExpiryTime = Date.now() + expiresIn * 1000;

  // Also store in sessionStorage for page refresh scenarios
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    sessionStorage.setItem(EXPIRY_STORAGE_KEY, tokenExpiryTime.toString());
  } catch (e) {
    console.warn('[tokenStore] sessionStorage unavailable:', e);
  }
};

/**
 * Get access token from memory or sessionStorage
 * @returns {string|null} - Access token or null if not available
 */
export const getAccessToken = () => {
  // Return from memory first (most common path)
  if (accessToken) {
    return accessToken;
  }

  // Try to recover from sessionStorage (page refresh scenario)
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const expiry = sessionStorage.getItem(EXPIRY_STORAGE_KEY);

    if (stored && expiry) {
      // Check if token hasn't expired
      if (Date.now() < parseInt(expiry)) {
        accessToken = stored;
        tokenExpiryTime = parseInt(expiry);
        return accessToken;
      } else {
        // Token expired, clear it
        clearAccessToken();
      }
    }
  } catch (e) {
    console.warn('[tokenStore] Failed to recover from sessionStorage:', e);
  }

  return null;
};

/**
 * Check if token is expired or about to expire
 * @param {number} bufferSeconds - Return true if expiry is within this many seconds (default 60)
 * @returns {boolean} - True if expired or expiring soon
 */
export const isTokenExpiring = (bufferSeconds = 60) => {
  if (!tokenExpiryTime) {
    return true;
  }

  const timeUntilExpiry = tokenExpiryTime - Date.now();
  return timeUntilExpiry < bufferSeconds * 1000;
};

/**
 * Get time remaining until token expires
 * @returns {number} - Milliseconds until expiry, or 0 if expired/not set
 */
export const getTokenTimeRemaining = () => {
  if (!tokenExpiryTime) {
    return 0;
  }

  const remaining = tokenExpiryTime - Date.now();
  return Math.max(0, remaining);
};

/**
 * Clear access token from memory and storage
 */
export const clearAccessToken = () => {
  accessToken = null;
  tokenExpiryTime = null;

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(EXPIRY_STORAGE_KEY);
  } catch (e) {
    console.warn('[tokenStore] Failed to clear sessionStorage:', e);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists and hasn't expired
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token && !isTokenExpiring();
};

export default {
  setAccessToken,
  getAccessToken,
  isTokenExpiring,
  getTokenTimeRemaining,
  clearAccessToken,
  isAuthenticated,
};
