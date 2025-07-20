// src/hooks/useClients.js
import { useState, useEffect } from 'react';
import clientService from '../services/clientService';

// Hook para obtener todos los clientes
export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FUNCIÓN ACTUALIZADA: Ahora acepta parámetros de filtro
  const fetchClients = async (filterParams = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getAllClients(filterParams);
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ CAMBIO PRINCIPAL: Cargar todos los clientes por defecto, no solo activos
    fetchClients('solo_activos=false');
  }, []);

  const createClient = async (clientData) => {
    const response = await clientService.createClient(clientData);
    if (response.client) {
      setClients(prev => [response.client, ...prev]);
      return response;
    }
    return response;
  };

  const updateClient = async (id, clientData) => {
    const response = await clientService.updateClient(id, clientData);
    if (response.client) {
      setClients(prev => prev.map(client => 
        client.id === id ? response.client : client
      ));
      return response;
    }
    return response;
  };

  const deleteClient = async (id) => {
    await clientService.deleteClient(id);
    setClients(prev => prev.filter(client => client.id !== id));
  };

// ✅ FUNCIÓN CORREGIDA: liberarHabitaciones
const liberarHabitaciones = async (id) => {
  console.log(`🔓 Iniciando liberación de habitaciones para cliente ${id}`);
  
  const result = await clientService.liberarHabitaciones(id);
  
  console.log('📊 Respuesta del servidor:', result);
  
  // ✅ CORRECCIÓN CRÍTICA: Actualizar correctamente el estado del cliente
  setClients(prev => prev.map(client => {
    if (client.id === id) {
      console.log(`🔄 Actualizando cliente ${id} en frontend:`, {
        habitaciones_liberadas: result.habitaciones_liberadas?.length || 0,
        cliente_activo_servidor: result.cliente_activo,
        fecha_salida_real: result.fecha_salida_real
      });
      
      return {
        ...client,
        // ✅ MANTENER habitaciones_asignadas (historial completo)
        // NO borrar habitaciones_asignadas porque contiene el historial
        
        // ✅ ACTUALIZAR habitaciones_activas (debe estar vacío después de liberar)
        habitaciones_activas: [],
        
        // ✅ MARCAR como inactivo
        esta_activo: false,
        
        // ✅ REGISTRAR fecha real de salida
        fecha_salida_real: result.fecha_salida_real,
        
        // ✅ ACTUALIZAR habitaciones_asignadas si vienen en la respuesta
        ...(result.habitaciones_asignadas && { 
          habitaciones_asignadas: result.habitaciones_asignadas 
        })
      };
    }
    return client;
  }));
  
  console.log(`✅ Cliente ${id} actualizado en frontend como RETIRADO`);
  
  return result;
};

  const addRoomsToClient = async (id, roomIds) => {
    const result = await clientService.addRoomsToClient(id, roomIds);
    if (result.client) {
      setClients(prev => prev.map(client => 
        client.id === id ? result.client : client
      ));
    }
    // También actualizar la lista completa para estar seguros
    await fetchClients('solo_activos=false');
    return result;
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    liberarHabitaciones,
    addRoomsToClient
  };
};

// ✅ Hook para obtener un cliente específico - VERSIÓN CORREGIDA CON ANTI-CACHÉ
export const useClient = (id) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClient = async (forceRefresh = false) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // ✅ SOLUCIÓN CRÍTICA: Agregar parámetros anti-caché
      const data = await clientService.getClientById(id, {
        _timestamp: Date.now(),
        refresh: forceRefresh || true,
        nocache: Date.now()
      });
      
      // ✅ DEBUGGING: Log para verificar datos frescos
      console.log('🔄 Fresh client data loaded:', {
        id: data.id,
        nombre: data.nombre_completo,
        habitaciones_activas: data.habitaciones_activas?.length || 0,
        habitaciones_asignadas: data.habitaciones_asignadas?.length || 0,
        esta_activo: data.esta_activo,
        fecha_salida_real: data.fecha_salida_real,
        timestamp: new Date().toISOString()
      });
      
      // ✅ VERIFICACIÓN ADICIONAL: Log detallado del estado
      if (data.habitaciones_activas?.length === 0 && data.fecha_salida_real) {
        console.log('✅ Cliente confirmado como RETIRADO - Sin habitaciones activas');
      } else if (data.habitaciones_activas?.length > 0) {
        console.log('🏠 Cliente tiene habitaciones activas:', data.habitaciones_activas);
      }
      
      setClient(data);
    } catch (err) {
      console.error('❌ Error fetching client:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const refreshClient = async () => {
    console.log('🔄 Manually refreshing client data...');
    await fetchClient(true); // Forzar refresh
  };

  return { 
    client, 
    loading, 
    error, 
    refreshClient
  };
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
      const data = await clientService.getAvailableRooms();
      setAvailableRooms(data.habitaciones || []);
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

// Hook para estadísticas de clientes
export const useClientStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClientStatistics();
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

// Hook para verificar disponibilidad de documento
export const useCheckDocument = () => {
  const [checking, setChecking] = useState(false);

  const checkDocument = async (tipoDocumento, numeroDocumento) => {
    try {
      setChecking(true);
      const result = await clientService.checkDocumentoDisponible(tipoDocumento, numeroDocumento);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setChecking(false);
    }
  };

  return {
    checkDocument,
    checking
  };
};

// ✅ Hook para habitaciones de un cliente - ACTUALIZADO CON ANTI-CACHÉ
export const useClientRooms = (clientId) => {
  const [clientRooms, setClientRooms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientRooms = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // ✅ ANTI-CACHÉ: Agregar timestamp a la consulta de habitaciones
      const data = await clientService.getClientRooms(clientId, {
        _timestamp: Date.now(),
        nocache: true
      });
      
      console.log('🏠 Client rooms data loaded:', {
        clientId,
        habitaciones_count: data.habitaciones_count || 0,
        timestamp: new Date().toISOString()
      });
      
      setClientRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientRooms();
  }, [clientId]);

  return {
    clientRooms,
    loading,
    error,
    refetch: fetchClientRooms
  };
};

// Hook para agregar habitaciones a un cliente específico
export const useAddRoomsToClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addRooms = async (clientId, roomIds) => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientService.addRoomsToClient(clientId, roomIds);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addRooms,
    loading,
    error
  };
};

// NUEVOS HOOKS: Para filtros por fecha
export const useClientsByDate = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClientsByDate = async (fecha) => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClientsByDate(fecha);
      setClients(data.clientes || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    loading,
    error,
    fetchClientsByDate
  };
};

export const useClientsByDateRange = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClientsByDateRange = async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClientsByDateRange(fechaInicio, fechaFin);
      setClients(data.clientes || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    loading,
    error,
    fetchClientsByDateRange
  };
};

export const useActiveClients = () => {
  const [activeClients, setActiveClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getActiveClients();
      setActiveClients(data.clientes_activos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveClients();
  }, []);

  return {
    activeClients,
    loading,
    error,
    refetch: fetchActiveClients
  };
};

export const useClientHistory = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClientHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientHistory();
  }, []);

  return {
    history,
    loading,
    error,
    refetch: fetchClientHistory
  };
};