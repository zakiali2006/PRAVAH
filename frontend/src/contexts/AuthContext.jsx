import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Force logout on every fresh open of the app as per user request
      localStorage.removeItem('token');
      setCurrentUser(null);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Simulate network delay for real feel
    await new Promise(r => setTimeout(r, 1200));
    
    // Hardcoded mock credentials
    if (password !== "Pravah@2026!") {
      throw new Error("Invalid credentials");
    }

    localStorage.setItem('token', 'mock_jwt_token_for_demo');
    
    const mockUser = {
      id: 1,
      email: email,
      full_name: "Demo Investor",
      role: "investor"
    };
    setCurrentUser(mockUser);
    return mockUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
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
