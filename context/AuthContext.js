import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    email: null,
    userId: null,
    firstName: null,
    lastName: null,
    middleName: null,
    isLoading: true,
  });

  // Load stored data when the app starts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUserData({
            ...JSON.parse(storedData),
            isLoading: false
          });
        } else {
          setUserData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        setUserData(prev => ({ ...prev, isLoading: false }));
      }
    };
    loadUserData();
  }, []);

  // Save user data with profile information
  const saveUserData = async (email, userId, profileData) => {
    const newData = { 
      email, 
      userId,
      firstName: profileData?.firstName || null,
      lastName: profileData?.lastName || null,
      middleName: profileData?.middleName || null,
      isLoading: false
    };
    
    try {
      setUserData(newData);
      await AsyncStorage.setItem('userData', JSON.stringify(newData));
    } catch (error) {
      console.error("Failed to save user data:", error);
      setUserData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Clear user data on logout
  const clearUserData = async () => {
    try {
      setUserData({ 
        email: null, 
        userId: null,
        firstName: null,
        lastName: null,
        middleName: null,
        isLoading: false
      });
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error("Failed to clear user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        saveUserData,
        clearUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};