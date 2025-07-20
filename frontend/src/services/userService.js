import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
//const API_BASE_URL = 'http://161.132.45.223:8000/api';

// Mapeo de grupos frontend -> backend
const GROUP_MAPPING = {
  'analista': 'Analista',
  'administrador': 'Administrador', 
  'visualizador': 'Visualizador'
};

// Mapeo inverso backend -> frontend
const GROUP_MAPPING_REVERSE = {
  'Analista': 'analista',
  'Administrador': 'administrador',
  'Visualizador': 'visualizador'
};

// Configurar axios con interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar refresh token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token también expiró, redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

class UserService {
  // Método para transformar la respuesta del backend
  transformUserResponse(userData) {
    // Convertir groups array a group_name para el frontend
    if (userData.groups && userData.groups.length > 0) {
      // Usar el primer grupo y convertir a minúsculas para el frontend
      const backendGroupName = userData.groups[0];
      userData.group_name = backendGroupName; // Mantener el nombre original para mostrar
      userData.group_frontend = GROUP_MAPPING_REVERSE[backendGroupName] || backendGroupName.toLowerCase();
    } else {
      userData.group_name = null;
      userData.group_frontend = null;
    }
    
    return userData;
  }

  async getAllUsers() {
    try {
      const response = await api.get('/users/');
      const users = response.data.results || response.data;
      
      // Transformar cada usuario
      const transformedUsers = users.map(user => this.transformUserResponse(user));
      
      return transformedUsers;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}/`);
      const transformedUser = this.transformUserResponse(response.data);
      return transformedUser;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      // Validar y limpiar datos
      const cleanData = this.cleanUserData(userData);
      
      const response = await api.post('/users/', cleanData);
      
      const transformedUser = this.transformUserResponse(response.data);
      
      return transformedUser;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      if (!id) {
        throw new Error('ID de usuario es requerido');
      }

      // Validar y limpiar datos
      const cleanData = this.cleanUserData(userData, true); // true = es actualización
      
      // Usar PATCH en lugar de PUT para actualizaciones parciales
      const response = await api.patch(`/users/${id}/`, cleanData);
      
      const transformedUser = this.transformUserResponse(response.data);
      
      return transformedUser;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(id) {
    try {
      await api.delete(`/users/${id}/`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Método auxiliar para limpiar datos
  cleanUserData(userData, isUpdate = false) {
    const cleanData = { ...userData };
    
    // Limpiar espacios en blanco
    const textFields = ['username', 'email', 'first_name', 'last_name', 'dni', 'phone'];
    textFields.forEach(field => {
      if (cleanData[field] && typeof cleanData[field] === 'string') {
        cleanData[field] = cleanData[field].trim();
      }
    });

    // Manejar password antes de validar campos requeridos
    if (isUpdate) {
      // En actualizaciones, solo incluir password si realmente se quiere cambiar
      if (!cleanData.password || cleanData.password.trim() === '') {
        delete cleanData.password;
      }
    }

    if (cleanData.group && cleanData.group !== '') {
      // Convertir de frontend a backend
      const backendGroupName = GROUP_MAPPING[cleanData.group];
      if (!backendGroupName) {
        throw new Error(`Grupo no válido: ${cleanData.group}`);
      }
      
      // Mantener el campo group para el backend
      cleanData.group = backendGroupName;
    } else {
      throw new Error('Debe seleccionar un grupo para el usuario');
    }

    // Validar campos requeridos
    const requiredFields = ['username', 'email', 'first_name', 'last_name', 'dni'];
    
    // Solo agregar password como requerido si NO es actualización
    if (!isUpdate) {
      requiredFields.push('password');
    }
    
    const missingFields = requiredFields.filter(field => {
      return !cleanData[field] || !cleanData[field].toString().trim();
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }

    // Remover campos vacíos opcionales
    if (!cleanData.phone || cleanData.phone === '') {
      cleanData.phone = null;
    }

    // Asegurar que is_active e is_staff sean booleanos
    cleanData.is_active = Boolean(cleanData.is_active);
    cleanData.is_staff = Boolean(cleanData.is_staff);
    
    return cleanData;
  }

  // Método auxiliar para manejar errores
  handleError(error) {
    if (error.response) {
      const errorData = error.response.data;
      
      if (error.response.status === 401) {
        return new Error('No tienes autorización. Por favor, inicia sesión.');
      }
      
      // Formatear errores de validación de Django
      if (errorData && typeof errorData === 'object') {
        const errorMessages = [];
        
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
          } else if (typeof errorData[field] === 'string') {
            errorMessages.push(`${field}: ${errorData[field]}`);
          }
        });
        
        if (errorMessages.length > 0) {
          return new Error(errorMessages.join('\n'));
        }
      }
      
      return new Error(errorData.detail || `Error HTTP: ${error.response.status}`);
    }
    
    return error;
  }
}

export default new UserService();

// Servicio para roles usando la misma configuración
export const roleService = {
  async getAllRoles() {
    try {
      const response = await api.get('/roles/');
      return response.data.results || response.data;
    } catch (error) {
      throw error;
    }
  }
};