// src/services/clientService.js
const API_BASE_URL = 'http://localhost:8000/api';
//const API_BASE_URL = 'http://161.132.45.223:8000/api';

// Estructura del cliente según el modelo Django
const defaultClientStructure = {
  id: null,
  nombres: '',
  apellidos: '',
  tipo_documento: '',
  numero_documento: '',
  edad: '',
  telefono: '',
  direccion: '',
  fecha_ingreso: '',
  fecha_salida: '',
  numero_habitaciones_deseadas: 1,
  tipo_pago: '',
  monto_pagado: '',
  habitaciones_seleccionadas: []
};

class ClientService {
  // ✅ FUNCIÓN ACTUALIZADA: Ahora acepta parámetros de filtro
  async getAllClients(filterParams = '') {
    try {
      const url = `${API_BASE_URL}/clients/${filterParams ? `?${filterParams}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          // ✅ ANTI-CACHÉ: Headers globales
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  // ✅ FUNCIÓN CRÍTICA ACTUALIZADA: getClientById con anti-caché
  async getClientById(id, cacheParams = {}) {
    try {
      // ✅ SOLUCIÓN PRINCIPAL: Construir URL con parámetros anti-caché
      const url = new URL(`${API_BASE_URL}/clients/${id}/`);
      
      // Agregar parámetros anti-caché que vienen del hook
      if (cacheParams._timestamp) {
        url.searchParams.append('_t', cacheParams._timestamp);
      }
      if (cacheParams.refresh) {
        url.searchParams.append('refresh', 'true');
      }
      if (cacheParams.nocache) {
        url.searchParams.append('nocache', cacheParams.nocache);
      }
      
      // Siempre agregar timestamp actual para garantizar URL única
      url.searchParams.append('_timestamp', Date.now());
      
      console.log('🔄 Fetching client with anti-cache URL:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          // ✅ HEADERS ANTI-CACHÉ CRÍTICOS
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Last-Modified': new Date().toUTCString()
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // ✅ LOG PARA VERIFICAR DATOS FRESCOS
      console.log('📡 Fresh client data received from API:', {
        id: data.id,
        nombre: data.nombre_completo,
        habitaciones_activas: data.habitaciones_activas?.length || 0,
        esta_activo: data.esta_activo,
        fecha_salida_real: data.fecha_salida_real,
        response_timestamp: new Date().toISOString()
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching client:', error);
      throw error;
    }
  }

  async createClient(clientData) {
    try {
      // Validar campos requeridos
      if (!clientData.nombres || clientData.nombres === '') {
        throw new Error('Los nombres son requeridos');
      }

      if (!clientData.apellidos || clientData.apellidos === '') {
        throw new Error('Los apellidos son requeridos');
      }

      if (!clientData.tipo_documento || clientData.tipo_documento === '') {
        throw new Error('El tipo de documento es requerido');
      }

      if (!clientData.numero_documento || clientData.numero_documento === '') {
        throw new Error('El número de documento es requerido');
      }

      if (!clientData.numero_habitaciones_deseadas || clientData.numero_habitaciones_deseadas <= 0) {
        throw new Error('El número de habitaciones deseadas es requerido');
      }

      if (!clientData.tipo_pago || clientData.tipo_pago === '') {
        throw new Error('El tipo de pago es requerido');
      }

      if (!clientData.monto_pagado || clientData.monto_pagado <= 0) {
        throw new Error('El monto pagado es requerido');
      }

      if (!clientData.habitaciones_seleccionadas || clientData.habitaciones_seleccionadas.length === 0) {
        throw new Error('Debe seleccionar al menos una habitación');
      }

      const response = await fetch(`${API_BASE_URL}/clients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(clientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id, clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(clientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  async getAvailableRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/habitaciones_disponibles/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  }

  async getClientStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/estadisticas/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching client statistics:', error);
      throw error;
    }
  }

  // ✅ FUNCIÓN ACTUALIZADA: getClientRooms con anti-caché
  async getClientRooms(id, cacheParams = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/clients/${id}/habitaciones/`);
      
      // Agregar parámetros anti-caché
      if (cacheParams._timestamp) {
        url.searchParams.append('_t', cacheParams._timestamp);
      }
      if (cacheParams.nocache) {
        url.searchParams.append('nocache', Date.now());
      }
      
      url.searchParams.append('_timestamp', Date.now());
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching client rooms:', error);
      throw error;
    }
  }

  async liberarHabitaciones(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}/liberar_habitaciones/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error liberating rooms:', error);
      throw error;
    }
  }

  async addRoomsToClient(id, roomIds) {
    try {
      if (!roomIds || roomIds.length === 0) {
        throw new Error('Debe seleccionar al menos una habitación');
      }

      const response = await fetch(`${API_BASE_URL}/clients/${id}/agregar_habitaciones/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          habitaciones_adicionales: roomIds
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding rooms to client:', error);
      throw error;
    }
  }

  // ✅ FUNCIÓN ACTUALIZADA: Validación inteligente de documentos
  // ✅ FUNCIÓN ACTUALIZADA: Validación inteligente de documentos
  async checkDocumentoDisponible(tipoDocumento, numeroDocumento) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/check_documento_disponible/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ 
          tipo_documento: tipoDocumento, 
          numero_documento: numeroDocumento 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // ✅ LOG PARA DEBUGGING
      console.log('📡 Document validation response:', {
        disponible: result.disponible,
        razon: result.razon,
        message: result.message,
        cliente_info: result.cliente_existente || result.cliente_anterior || null
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error checking document:', error);
      throw error;
    }
  }

  async searchClients(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/buscar/?q=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }

  // ✅ NUEVAS FUNCIONES: Para filtros por fecha
  async getClientsByDate(fecha) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/por_fecha/?fecha=${fecha}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching clients by date:', error);
      throw error;
    }
  }

  async getClientsByDateRange(fechaInicio, fechaFin) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/por_rango_fechas/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching clients by date range:', error);
      throw error;
    }
  }

  async getActiveClients() {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/activos/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching active clients:', error);
      throw error;
    }
  }

  async getClientHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/historial/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching client history:', error);
      throw error;
    }
  }
}

export default new ClientService();