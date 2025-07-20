// src/hooks/useGroups.js
import { useState, useEffect } from 'react';
import groupService, { permissionService } from '../services/groupService';

// Hook para obtener todos los grupos
export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getAllGroups();
      setGroups(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const createGroup = async (groupData) => {
    try {
      const newGroup = await groupService.createGroup(groupData);
      await fetchGroups(); // Recargar la lista
      return newGroup;
    } catch (err) {
      throw err;
    }
  };

  const updateGroup = async (id, groupData) => {
    try {
      const updatedGroup = await groupService.updateGroup(id, groupData);
      await fetchGroups(); // Recargar la lista
      return updatedGroup;
    } catch (err) {
      throw err;
    }
  };

  const deleteGroup = async (id) => {
    try {
      await groupService.deleteGroup(id);
      await fetchGroups(); // Recargar la lista
    } catch (err) {
      throw err;
    }
  };

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  };
};

// Hook para obtener un grupo específico
export const useGroup = (id) => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchGroup = async () => {
      try {
        setLoading(true);
        const data = await groupService.getGroupById(id);
        setGroup(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  return { group, loading, error };
};

// Hook para obtener todos los permisos
export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const data = await permissionService.getAllPermissions();
        setPermissions(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return { permissions, loading, error };
};