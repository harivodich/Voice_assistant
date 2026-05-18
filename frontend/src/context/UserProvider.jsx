import React, { useCallback, useEffect, useState } from "react";
import {
  api,
  getApiBaseUrl,
  getStoredToken,
  paths,
  setStoredToken,
  setUnauthorizedHandler,
} from "../services/http";
import { normalizeUser, userDataContext as UserDataContext } from "./userContext";

export default function UserProvider({ children }) {
  const serverUrl = getApiBaseUrl();
  const [userData, setUserData] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const clearSession = useCallback(() => {
    setStoredToken(null);
    setUserData(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUserData(null);
      setAuthReady(true);
      return;
    }
    try {
      const { data } = await api.get(paths.user.me);
      setUserData(normalizeUser(data));
    } catch {
      clearSession();
    } finally {
      setAuthReady(true);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      await api.post(paths.auth.logout);
    } catch {
      /* ignore */
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
    authReady,
    refreshUser,
    logout,
    setStoredToken,
    normalizeUser,
  };

  return (
    <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
  );
}
