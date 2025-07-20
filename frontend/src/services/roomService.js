// src/services/roomService.js
const API_BASE_URL = 'http://localhost:8000/api';
//const API_BASE_URL = 'http://161.132.45.223:8000/api';

// Estructura de la habitación según tu modelo Django
const defaultRoomStructure = {
  id: null,
  numero: '',
  tipo: '',
  precio_noche: '',
  estado: 'disponible',
  descripcion: ''
};

class RoomService {
  async getAllRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/`, {
        method: 'GET',
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
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }

  async getRoomById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${id}/`, {
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
      console.error('Error fetching room:', error);
      throw error;
    }
  }

  async createRoom(roomData) {
    try {
      // Validar campos requeridos
      if (!roomData.numero || roomData.numero === '') {
        throw new Error('El número de habitación es requerido');
      }

      if (!roomData.tipo || roomData.tipo === '') {
        throw new Error('El tipo de habitación es requerido');
      }

      if (!roomData.precio_noche || roomData.precio_noche <= 0) {
        throw new Error('El precio por noche es requerido');
      }

      const response = await fetch(`${API_BASE_URL}/rooms/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(roomData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async updateRoom(id, roomData) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(roomData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  }

  async deleteRoom(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${id}/`, {
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
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  async getAvailableRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/disponibles/`, {
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
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  }

  async getRoomsByType() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/por_tipo/`, {
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
      console.error('Error fetching rooms by type:', error);
      throw error;
    }
  }

  async getRoomStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/estadisticas/`, {
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
      console.error('Error fetching room statistics:', error);
      throw error;
    }
  }

  async changeRoomStatus(id, estado) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${id}/cambiar_estado/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ estado }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error changing room status:', error);
      throw error;
    }
  }

  async checkRoomNumberAvailable(numero) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/check_numero_disponible/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ numero }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking room number:', error);
      throw error;
    }
  }

  async searchRooms(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/buscar/?q=${encodeURIComponent(query)}`, {
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
      console.error('Error searching rooms:', error);
      throw error;
    }
  }
}

export default new RoomService();