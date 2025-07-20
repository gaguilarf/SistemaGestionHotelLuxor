// src/Components/users/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';
import FormField from '../common/FormField';
import { roleService } from '../../services/userService';
import { useFormValidation } from '../../hooks/useFormValidation';

const UserForm = ({ user = null, onSubmit, onCancel, loading = false }) => {
  const { errors, validateForm, clearError } = useFormValidation(user === null); // true si es nuevo usuario
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    dni: '',
    phone: '',
    password: '',
    confirm_password: '',
    is_active: true,
    is_staff: false,
    role: '',
  });

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Cargar roles
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const rolesData = await roleService.getAllRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Error loading roles:', error);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Llenar formulario si se está editando
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        dni: user.dni || '',
        phone: user.phone || '',
        password: '',
        confirm_password: '',
        is_active: user.is_active,
        is_staff: user.is_staff,
        role: user.role?.id || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      clearError(name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    const submitData = prepareSubmitData(formData);
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        
        <FormHeader user={user} onCancel={onCancel} />
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <FormField
              id="username"
              name="username"
              label="Nombre de Usuario"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="nombre_usuario"
              autoComplete="username"
              variant="modal"
              required
            />

            <FormField
              id="email"
              name="email"
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
              variant="modal"
              required
            />

            <FormField
              id="first_name"
              name="first_name"
              label="Nombre"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              placeholder="Juan"
              autoComplete="given-name"
              variant="modal"
              required
            />

            <FormField
              id="last_name"
              name="last_name"
              label="Apellido"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              placeholder="Pérez"
              autoComplete="family-name"
              variant="modal"
              required
            />

            <FormField
              id="dni"
              name="dni"
              label="DNI"
              value={formData.dni}
              onChange={handleChange}
              error={errors.dni}
              placeholder="12345678"
              autoComplete="off"
              variant="modal"
              required
            />

            <FormField
              id="phone"
              name="phone"
              label="Teléfono"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+51 999 999 999"
              autoComplete="tel"
              variant="modal"
            />

            <RoleSelect
              roles={roles}
              value={formData.role}
              onChange={handleChange}
              loadingRoles={loadingRoles}
            />

            <FormField
              id="password"
              name="password"
              type="password"
              label={`Contraseña ${!user ? '*' : ''}`}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder={user ? 'Dejar vacío para mantener actual' : 'Mínimo 8 caracteres'}
              autoComplete="new-password"
              variant="modal"
              required={!user}
            />

            {formData.password && (
              <FormField
                id="confirm_password"
                name="confirm_password"
                type="password"
                label="Confirmar Contraseña"
                value={formData.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
                placeholder="Repetir contraseña"
                autoComplete="new-password"
                variant="modal"
                required
              />
            )}

          </div>

          <UserCheckboxes formData={formData} onChange={handleChange} />
          <FormActions onCancel={onCancel} loading={loading} user={user} />

        </form>
      </div>
    </div>
  );
};

// Componentes extraídos
const FormHeader = ({ user, onCancel }) => (
  <div className="flex justify-between items-center p-6 border-b">
    <h2 className="text-xl font-semibold text-gray-900">
      {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
    </h2>
    <button
      onClick={onCancel}
      className="text-gray-400 hover:text-gray-600"
      aria-label="Cerrar formulario"
    >
      <X size={24} />
    </button>
  </div>
);

const RoleSelect = ({ roles, value, onChange, loadingRoles }) => (
  <div>
    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
      Rol
    </label>
    <select
      id="role"
      name="role"
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={loadingRoles}
    >
      <option value="">Seleccionar rol</option>
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
    {loadingRoles && (
      <p className="mt-1 text-sm text-gray-500">Cargando roles...</p>
    )}
  </div>
);

const UserCheckboxes = ({ formData, onChange }) => (
  <div className="mt-6 space-y-4">
    <label className="flex items-center cursor-pointer">
      <input
        id="is_active"
        name="is_active"
        type="checkbox"
        checked={formData.is_active}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <span className="ml-2 block text-sm text-gray-900">Usuario activo</span>
    </label>

    <label className="flex items-center cursor-pointer">
      <input
        id="is_staff"
        name="is_staff"
        type="checkbox"
        checked={formData.is_staff}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <span className="ml-2 block text-sm text-gray-900">
        Personal de staff (puede acceder al panel admin)
      </span>
    </label>
  </div>
);

const FormActions = ({ onCancel, loading, user }) => (
  <div className="mt-8 flex justify-end space-x-4">
    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
      Cancelar
    </Button>
    <Button type="submit" variant="primary" loading={loading} disabled={loading}>
      {user ? 'Actualizar Usuario' : 'Crear Usuario'}
    </Button>
  </div>
);

// Función auxiliar
const prepareSubmitData = (formData) => {
  const submitData = { ...formData };
  delete submitData.confirm_password;
  
  if (!submitData.password) {
    delete submitData.password;
  }

  if (submitData.role) {
    submitData.role = parseInt(submitData.role);
  } else {
    submitData.role = null;
  }

  return submitData;
};

export default UserForm;