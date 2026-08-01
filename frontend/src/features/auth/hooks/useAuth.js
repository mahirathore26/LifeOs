import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  fetchCurrentUser,
  loginUser,
  logoutLocal,
  registerUser,
} from '../authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = useCallback((credentials) => dispatch(loginUser(credentials)), [dispatch]);
  const register = useCallback((payload) => dispatch(registerUser(payload)), [dispatch]);
  const getCurrentUser = useCallback(() => dispatch(fetchCurrentUser()), [dispatch]);
  const logout = useCallback(() => dispatch(logoutLocal()), [dispatch]);
  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    getCurrentUser,
    logout,
    clearError,
  };
}

export default useAuth;
