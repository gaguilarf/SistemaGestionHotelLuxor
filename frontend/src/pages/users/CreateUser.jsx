// src/pages/users/CreateUser.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, Users, Shield } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { useGroups } from '../../hooks/useGroups';
import Button from '../../Components/common/Button';

const CreateUser = () => {
  const navigate = useNavigate();
  const { createUser } = useUsers();
  const { groups } = useGroups();
  const [loading, setLoading] = useState(false);
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
    group: '',
  });
  const [errors, setErrors] = useState({});

  const groupOptions = [
    { value: '', label: 'Seleccionar grupo...' },
    { value: 'analista', label: 'Analista' },
    { value: 'administrador', label: 'Administrador' },
    { value: 'visualizador', label: 'Visualizador' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };
      delete submitData.confirm_password;
      await createUser(submitData);
      alert('Usuario creado exitosamente');
      navigate('/users');
    } catch (error) {
      alert('Error al crear usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.first_name.trim()) newErrors.first_name = 'El nombre es requerido';
    if (!formData.last_name.trim()) newErrors.last_name = 'El apellido es requerido';
    if (!formData.dni.trim()) newErrors.dni = 'El DNI es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (!formData.group) newErrors.group = 'Debe seleccionar un grupo';

    if (formData.dni && !/^\d{8}$/.test(formData.dni.trim())) {
      newErrors.dni = 'El DNI debe tener exactamente 8 números';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </Button>
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
          <p className="text-gray-600 text-sm">Completa el formulario para crear un nuevo usuario</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Información del Usuario</h2>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Juan"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Pérez"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
                    DNI *
                  </label>
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.dni ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="12345678"
                  />
                  {errors.dni && (
                    <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="999999999"
                  />
                </div>
              </div>
            </div>

            {/* Información de Cuenta */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                Información de Cuenta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="nombre_usuario"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="usuario@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                Seguridad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Repetir contraseña"
                  />
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Grupo y Estado */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-gray-500" />
                Grupo y Estado
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Grupo *
                  </label>
                  <select
                    id="group"
                    name="group"
                    value={formData.group}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.group ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {groupOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.group && (
                    <p className="mt-1 text-sm text-red-600">{errors.group}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Selecciona el grupo que define los permisos del usuario
                  </p>
                </div>

                <div>
                  <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="flex items-center">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Usuario activo</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 md:flex-row md:justify-end md:space-y-0 md:space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="w-full md:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                {loading ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;