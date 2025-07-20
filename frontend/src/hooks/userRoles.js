
// src/hooks/useRoles.js
import { useState, useEffect } from 'react';
import { roleService } from '../services/userService';
export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRoles();
  }, []);
  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
  };
};