// src/hooks/useRooms.js
import { useState, useEffect } from 'react';
import roomService from '../services/roomService';

// Hook para obtener todas las habitaciones
export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const createRoom = async (roomData) => {
    const newRoom = await roomService.createRoom(roomData);
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  };

  const updateRoom = async (id, roomData) => {
    const updatedRoom = await roomService.updateRoom(id, roomData);
    setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room));
    return updatedRoom;
  };

  const deleteRoom = async (id) => {
    await roomService.deleteRoom(id);
    setRooms(prev => prev.filter(room => room.id !== id));
  };

  const changeRoomStatus = async (id, estado) => {
    const result = await roomService.changeRoomStatus(id, estado);
    setRooms(prev => prev.map(room => 
      room.id === id ? { ...room, estado } : room
    ));
    return result;
  };

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    changeRoomStatus
  };
};

// Hook para obtener una habitación específica
export const useRoom = (id) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await roomService.getRoomById(id);
        setRoom(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  return { room, loading, error };
};

// Hook para obtener habitaciones disponibles
export const useAvailableRooms = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getAvailableRooms();
      setAvailableRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  return {
    availableRooms,
    loading,
    error,
    refetch: fetchAvailableRooms
  };
};

// Hook para obtener habitaciones por tipo
export const useRoomsByType = () => {
  const [roomsByType, setRoomsByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoomsByType = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getRoomsByType();
      setRoomsByType(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsByType();
  }, []);

  return {
    roomsByType,
    loading,
    error,
    refetch: fetchRoomsByType
  };
};

// Hook para estadísticas de habitaciones
export const useRoomStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getRoomStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics
  };
};

// Hook para verificar disponibilidad de número
export const useCheckRoomNumber = () => {
  const [checking, setChecking] = useState(false);

  const checkNumber = async (numero) => {
    try {
      setChecking(true);
      const result = await roomService.checkRoomNumberAvailable(numero);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setChecking(false);
    }
  };

  return {
    checkNumber,
    checking
  };
};
