import { useState, useEffect, createContext, useContext } from 'react';
import { api, getToken, removeToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      const storedUser = localStorage.getItem('user_data');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching current user
          const response = await api.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
            localStorage.setItem('user_data', JSON.stringify(response.data));
          } else {
            // Token invalid, clear everything
            removeToken();
            localStorage.removeItem('user_data');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Token invalid or network error
          removeToken();
          localStorage.removeItem('user_data');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
