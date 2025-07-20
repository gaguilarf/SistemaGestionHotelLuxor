// src/utils/validators.js
// Funciones existentes
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Nuevas funciones para formularios de usuarios
export const validateDNI = (dni) => {
  return dni && dni.length >= 7;
};

export const validateUserForm = (formData, isEditing = false) => {
  const errors = {};

  // Campos requeridos
  if (!validateRequired(formData.username)) {
    errors.username = 'El nombre de usuario es requerido';
  }
  
  if (!validateRequired(formData.email)) {
    errors.email = 'El email es requerido';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'El formato del email no es válido';
  }

  if (!validateRequired(formData.first_name)) {
    errors.first_name = 'El nombre es requerido';
  }

  if (!validateRequired(formData.last_name)) {
    errors.last_name = 'El apellido es requerido';
  }

  if (!validateRequired(formData.dni)) {
    errors.dni = 'El DNI es requerido';
  } else if (!validateDNI(formData.dni)) {
    errors.dni = 'El DNI debe tener al menos 7 caracteres';
  }

  // Validación de contraseña
  if (!isEditing && !formData.password) {
    errors.password = 'La contraseña es requerida';
  }
  
  if (formData.password && !validatePassword(formData.password)) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  }

  if (formData.password && formData.password !== formData.confirm_password) {
    errors.confirm_password = 'Las contraseñas no coinciden';
  }

  return errors;
};