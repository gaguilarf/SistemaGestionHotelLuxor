// src/services/reservationService.js
const API_BASE_URL = 'http://localhost:8000/api';

class ReservationService {
  // Obtener todas las reservas con filtros
  async getAllReservations(filterParams = '') {
    try {
      const url = `${API_BASE_URL}/reservations/${filterParams ? `?${filterParams}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
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
      
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  // Obtener reserva por ID
  async getReservationById(id, cacheParams = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/reservations/${id}/`);
      
      // Agregar parámetros anti-caché
      if (cacheParams._timestamp) {
        url.searchParams.append('_t', cacheParams._timestamp);
      }
      if (cacheParams.refresh) {
        url.searchParams.append('refresh', 'true');
      }
      
      url.searchParams.append('_timestamp', Date.now());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
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
      console.error('Error fetching reservation:', error);
      throw error;
    }
  }

  // Crear nueva reserva
  async createReservation(reservationData) {
    try {
      // Validaciones básicas
      if (!reservationData.cliente) {
        throw new Error('El cliente es requerido');
      }
      if (!reservationData.fecha_reserva) {
        throw new Error('La fecha de reserva es requerida');
      }
      if (!reservationData.numero_habitaciones || reservationData.numero_habitaciones <= 0) {
        throw new Error('El número de habitaciones es requerido');
      }
      if (!reservationData.monto_total || reservationData.monto_total <= 0) {
        throw new Error('El monto total es requerido');
      }
      if (!reservationData.habitaciones_seleccionadas || reservationData.habitaciones_seleccionadas.length === 0) {
        throw new Error('Debe seleccionar al menos una habitación');
      }

      const response = await fetch(`${API_BASE_URL}/reservations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(reservationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  // Actualizar reserva
  async updateReservation(id, reservationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(reservationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  // Cancelar/eliminar reserva
  async cancelReservation(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/`, {
        method: 'DELETE',
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
      console.error('Error canceling reservation:', error);
      throw error;
    }
  }

  // Marcar reserva como estadía activa
  async marcarComoActiva(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/marcar_como_activa/`, {
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
      console.error('Error marking as active:', error);
      throw error;
    }
  }

  // Marcar reserva como esperando cliente
  async marcarComoEsperando(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/marcar_como_esperando/`, {
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
      console.error('Error marking as waiting:', error);
      throw error;
    }
  }

  // Registrar pago
  async registrarPago(id, monto) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/registrar_pago/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ monto }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error registering payment:', error);
      throw error;
    }
  }

  // Agregar habitaciones a reserva
  async agregarHabitaciones(id, habitacionesIds) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/agregar_habitaciones/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ habitaciones_adicionales: habitacionesIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding rooms:', error);
      throw error;
    }
  }

  // Obtener habitaciones de una reserva
  async getReservationRooms(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/habitaciones/`, {
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
      console.error('Error fetching reservation rooms:', error);
      throw error;
    }
  }

  // Verificar disponibilidad
  async verificarDisponibilidad(fechaReserva, numeroHabitaciones) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/verificar_disponibilidad/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          fecha_reserva: fechaReserva,
          numero_habitaciones: numeroHabitaciones
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  async getStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/estadisticas/`, {
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
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  // Obtener reservas esperando cliente
  async getReservasEsperando() {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/esperando_cliente/`, {
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
      console.error('Error fetching waiting reservations:', error);
      throw error;
    }
  }

  // Obtener estadías activas
  async getEstadiasActivas() {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/estadias_activas/`, {
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
      console.error('Error fetching active stays:', error);
      throw error;
    }
  }

  // Obtener reservas vencidas
  async getReservasVencidas() {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/vencidas/`, {
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
      console.error('Error fetching expired reservations:', error);
      throw error;
    }
  }

  // Obtener reservas de hoy
  async getReservasHoy() {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/hoy/`, {
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
      console.error('Error fetching today reservations:', error);
      throw error;
    }
  }

  // Buscar reservas
  async searchReservations(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/buscar/?q=${encodeURIComponent(query)}`, {
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
      console.error('Error searching reservations:', error);
      throw error;
    }
  }

  // Obtener reservas por fecha
  async getReservationsByDate(fecha) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/por_fecha/?fecha=${fecha}`, {
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
      console.error('Error fetching reservations by date:', error);
      throw error;
    }
  }

  // Obtener reservas por rango de fechas
  async getReservationsByDateRange(fechaInicio, fechaFin) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/por_rango_fechas/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, {
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
      console.error('Error fetching reservations by date range:', error);
      throw error;
    }
  }
}

export default new ReservationService();