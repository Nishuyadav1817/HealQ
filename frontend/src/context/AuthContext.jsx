import React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAccessToken, clearAccessToken } from '../services/tokenStore';
import { connectSocket, disconnectSocket } from '../sockets/socketClient';
import { loginRequest, logoutRequest, refreshTokenRequest } from '../features/auth/services/auth.api';

const AuthContext = createContext(undefined);

/**
 * Owns the app's ONE piece of client-side auth state: the current user
 * (or null) and a loading flag for the initial bootstrap. The access
 * token itself deliberately does NOT live here as React state — it lives
 * in tokenStore.js (see that file for why), so a token refresh never
 * needs to trigger a re-render of everything that reads useAuth().
 */
export { AuthContext };
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until bootstrap finishes

  const handleAuthenticated = useCallback((data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
    connectSocket(); // (re)connect now that tokenStore has a fresh token
  }, []);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
    disconnectSocket();
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { data } = await loginRequest(credentials);
      handleAuthenticated(data.data);
      return data.data.user;
    },
    [handleAuthenticated]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      // Always clear local state, even if the network call fails (e.g.
      // offline) — a user clicking "log out" expects to be logged out of
      // THIS tab regardless of whether the server round trip succeeded.
      clearSession();
    }
  }, [clearSession]);

  // On first load, there is no access token in memory (by design — see
  // tokenStore.js). This silently attempts a refresh using the httpOnly
  // refresh-token cookie, so a page reload doesn't force a fresh login as
  // long as a valid session cookie still exists.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await refreshTokenRequest();
        if (!cancelled) handleAuthenticated(data.data);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // apiClient dispatches this when a token refresh fails mid-session
  // (e.g. the refresh token itself expired or was reused) — see
  // services/apiClient.js. A DOM event, not a direct import, is what lets
  // that file trigger a logout without importing React/context at all.
  useEffect(() => {
    const handleForcedLogout = () => clearSession();
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return ctx;
};
