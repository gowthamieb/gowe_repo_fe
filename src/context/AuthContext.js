import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Load auth data from localStorage on mount
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('authToken');
        const onboardingStatus = localStorage.getItem('onboardingComplete');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setAuthToken(storedToken);
        }

        if (onboardingStatus === 'true') {
          setIsOnboardingComplete(true);
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);

      if (response.success) {
        const { user, token } = response.data;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', token);

        setUser(user);
        setAuthToken(token);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'An error occurred during login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);

      if (response.success) {
        const { user, token } = response.data;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', token);

        setUser(user);
        setAuthToken(token);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'An error occurred during registration');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Optionally call logout API
      await authApi.logout(authToken);

      localStorage.removeItem('user');
      localStorage.removeItem('authToken');

      setUser(null);
      setAuthToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = () => {
    try {
      localStorage.setItem('onboardingComplete', 'true');
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Failed to set onboarding complete:', error);
    }
  };

  const updateUserProfile = async (updatedData) => {
    try {
      setIsLoading(true);
      const response = await authApi.updateProfile(user.id, updatedData, authToken);

      if (response.success) {
        const updatedUser = { ...user, ...updatedData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return true;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.message || 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    authToken,
    isLoading,
    isAuthenticated: !!user,
    isOnboardingComplete,
    login,
    register,
    logout,
    completeOnboarding,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
