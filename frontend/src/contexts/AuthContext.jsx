import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (localStorage.getItem('token')) {
        try {
          const response = await api.get('/auth/me');
          setCurrentUser(response.data.data);
        } catch (err) {
          console.error("Auth me error:", err);
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password, portalType = null) => {
    try {
      const payload = { email, password };
      if (portalType) {
        payload.portal_type = portalType;
      }
      const response = await api.post('/auth/login', payload);
      const token = response.data.data.access_token;
      localStorage.setItem('token', token);
      
      // Fetch profile immediately after login
      const profileRes = await api.get('/auth/me');
      setCurrentUser(profileRes.data.data);
      return profileRes.data.data;
    } catch (err) {
      console.error("Auth login error:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
