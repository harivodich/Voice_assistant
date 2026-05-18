import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Check for stored user data on app start
    const loadUserData = async () => {
      try {
        const [userValue, tokenValue] = await Promise.all([
          AsyncStorage.getItem('userData'),
          AsyncStorage.getItem('userToken')
        ]);

        if (userValue != null) {
          setUserData(JSON.parse(userValue));
        }
        if (tokenValue != null) {
          setUserToken(tokenValue);
        }
      } catch (e) {
        console.error("Failed to load user data", e);
      } finally {
        setAuthReady(true);
      }
    };

    loadUserData();
  }, []);

  const login = async (authData) => {
    try {
      // Backend returns { user, accessToken }
      setUserData(authData.user);
      setUserToken(authData.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(authData.user));
      if (authData.accessToken) {
        await AsyncStorage.setItem('userToken', authData.accessToken);
      }
    } catch (e) {
      console.error("Failed to save auth data", e);
    }
  };

  const logout = async () => {
    try {
      setUserData(null);
      setUserToken(null);
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userToken');
    } catch (e) {
      console.error("Failed to remove auth data", e);
    }
  };

  const updateUserData = async (newUserData) => {
    try {
      setUserData(newUserData);
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
    } catch (e) {
      console.error("Failed to update user data", e);
    }
  };

  return (
    <AuthContext.Provider value={{ userData, userToken, authReady, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
