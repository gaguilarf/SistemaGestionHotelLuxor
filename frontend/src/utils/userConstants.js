// src/utils/userConstants.js

export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

export const USER_PERMISSIONS = {
  STAFF: true,
  REGULAR: false,
};

export const USER_VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 150,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Solo letras, números y guiones bajos'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Formato de email inválido'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número'
  },
  dni: {
    minLength: 7,
    maxLength: 20,
    pattern: /^[0-9]+$/,
    message: 'Solo números'
  },
  phone: {
    pattern: /^[\+]?[0-9\s\-\(\)]+$/,
    message: 'Formato de teléfono inválido'
  }
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
};

// Función para formatear el nombre completo
export const formatFullName = (user) => {
  if (!user) return '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName} ${lastName}`.trim() || user.username || user.email;
};

// Función para obtener las iniciales
export const getUserInitials = (user) => {
  if (!user) return '?';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  
  if (user.first_name) {
    return user.first_name[0].toUpperCase();
  }
  
  if (user.username) {
    return user.username[0].toUpperCase();
  }
  
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  return '?';
};

// Función para formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para validar DNI peruano
export const validatePeruvianDNI = (dni) => {
  if (!dni) return false;
  return /^\d{8}$/.test(dni);
};

// Función para formatear teléfono peruano
export const formatPeruvianPhone = (phone) => {
  if (!phone) return '';
  
  // Remover todos los caracteres no numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Si empieza con 51, es código de país
  if (numbers.startsWith('51')) {
    const nationalNumber = numbers.substring(2);
    if (nationalNumber.length === 9) {
      return `+51 ${nationalNumber.substring(0, 3)} ${nationalNumber.substring(3, 6)} ${nationalNumber.substring(6)}`;
    }
  }
  
  // Si tiene 9 dígitos, asumir que es número nacional
  if (numbers.length === 9) {
    return `${numbers.substring(0, 3)} ${numbers.substring(3, 6)} ${numbers.substring(6)}`;
  }
  
  return phone;
};
