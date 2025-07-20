
// src/services/groupService.js
const API_BASE_URL = 'http://localhost:8000/api';
//const API_BASE_URL = 'http://161.132.45.223:8000/api';

// Estructura del grupo según tu modelo Django
const defaultGroupStructure = {
  id: null,
  name: '',
  permissions: [], // Array de IDs de permisos
};

class GroupService {
  async getAllGroups() {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/`, {
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
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  async getGroupById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${id}/`, {
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
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  async createGroup(groupData) {
    try {
      // Validar campos requeridos
      if (!groupData.name || groupData.name.trim() === '') {
        throw new Error('El nombre del grupo es requerido');
      }

      const response = await fetch(`${API_BASE_URL}/groups/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(groupData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async updateGroup(id, groupData) {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(groupData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${id}/`, {
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
      console.error('Error deleting group:', error);
      throw error;
    }
  }
}

export default new GroupService();

// Servicio para permisos
export const permissionService = {
  async getAllPermissions() {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions/`, {
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
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }
};