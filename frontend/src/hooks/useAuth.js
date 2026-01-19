import { useState, useCallback } from 'react';
import { authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
      navigate('/');
    }
  }, [navigate]);

  return {
    user,
    setUser,
    loading,
    checkAuth,
    logout
  };
}

export default useAuth;
