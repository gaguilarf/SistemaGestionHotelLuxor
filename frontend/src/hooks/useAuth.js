// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      fetchUser();
    } else {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [fetchUser]);

  const login = async (username, password) => {
    try {
      await authService.login(username, password);
      await fetchUser(); // Esperar a que se cargue el usuario
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsInitialized(true); // Mantener como inicializado
    setLoading(false); // Asegurar que no quede en loading
  };

  // Verificar si el usuario tiene un grupo específico
  const hasGroup = (groupName) => {
    return user?.groups?.includes(groupName) || false;
  };

  // Verificar si el usuario tiene alguno de los grupos especificados
  const hasAnyGroup = (groupNames) => {
    return groupNames.some(groupName => hasGroup(groupName));
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permissionCodename) => {
    return user?.group_permissions?.includes(permissionCodename) || 
           user?.user_permissions?.includes(permissionCodename) ||
           user?.is_superuser || false;
  };

  // Verificar si el usuario es superusuario
  const isSuperUser = () => {
    return user?.is_superuser || false;
  };

  return {
    user,
    loading,
    error,
    isInitialized,
    login,
    logout,
    hasGroup,
    hasAnyGroup,
    hasPermission,
    isSuperUser,
    isAuthenticated: !!user,
    refetch: fetchUser,
  };
};