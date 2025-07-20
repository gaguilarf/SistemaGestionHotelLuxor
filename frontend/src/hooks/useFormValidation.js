// src/hooks/useFormValidation.js
import { useState } from 'react';
import { validateUserForm } from '../utils/validators';

export const useFormValidation = (isEditing = false) => {
  const [errors, setErrors] = useState({});

  const validateForm = (formData) => {
    const newErrors = validateUserForm(formData, isEditing);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    clearError,
    clearAllErrors
  };
};