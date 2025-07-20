// src/pages/groups/CreateGroup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Check, X } from 'lucide-react';
import { useGroups, usePermissions } from '../../hooks/useGroups';
import Button from '../../Components/common/Button';

const CreateGroup = () => {
  const navigate = useNavigate();
  const { createGroup } = useGroups();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    permissions: []
  });
  const [errors, setErrors] = useState({});
  const [searchPermission, setSearchPermission] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setErrors({ name: 'El nombre del grupo es requerido' });
      return;
    }

    setLoading(true);
    try {
      await createGroup(formData);
      alert('Grupo creado exitosamente');
      navigate('/groups');
    } catch (error) {
      alert('Error al crear grupo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/groups');
  };

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
    if (errors.name) {
      setErrors({});
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setFormData({ ...formData, permissions: [] });
    } else {
      setFormData({ 
        ...formData, 
        permissions: filteredPermissions.map(p => p.id) 
      });
    }
    setSelectAll(!selectAll);
  };

  const filteredPermissions = permissions.filter(permission => 
    permission.name && permission.name.toLowerCase().includes(searchPermission.toLowerCase()) ||
    permission.codename && permission.codename.toLowerCase().includes(searchPermission.toLowerCase())
  );

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const parts = permission.codename && permission.codename.split('_') || [];
    const model = parts.length > 1 ? parts[parts.length - 1] : 'otros';
    
    if (!acc[model]) {
      acc[model] = [];
    }
    acc[model].push(permission);
    return acc;
  }, {});

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Crear Nuevo Rol</h1>
          <p className="text-gray-600 text-sm">Define el nombre y los permisos del rol</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Información del Rol</h2>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Group Name */}
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Rol *
              </label>
              <input
                type="text"
                id="group-name"
                name="groupName"
                value={formData.name}
                onChange={handleNameChange}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Administradores, Analistas, Recepcionistas"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Permissions Section */}
            <div>
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Permisos del Rol
                </label>
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs md:text-sm w-full md:w-auto"
                  >
                    {selectAll ? (
                      <>
                        <X size={14} className="mr-1" />
                        Deseleccionar todos
                      </>
                    ) : (
                      <>
                        <Check size={14} className="mr-1" />
                        Seleccionar todos
                      </>
                    )}
                  </Button>
                  <span className="text-xs md:text-sm text-gray-500 text-center md:text-left">
                    {formData.permissions.length} de {permissions.length} seleccionados
                  </span>
                </div>
              </div>

              {/* Search Permissions */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar permisos..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={searchPermission}
                  onChange={(e) => setSearchPermission(e.target.value)}
                />
              </div>

              {/* Permissions List */}
              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600 text-sm">Cargando permisos...</span>
                </div>
              ) : (
                <div className="max-h-64 md:max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {Object.keys(groupedPermissions).length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No se encontraron permisos
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {Object.entries(groupedPermissions).map(([model, modelPermissions]) => (
                        <div key={model} className="p-3 md:p-4">
                          <h4 className="text-xs md:text-sm font-medium text-gray-900 mb-3 flex items-center">
                            <Lock className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-400" />
                            {model.toUpperCase()}
                          </h4>
                          <div className="space-y-2">
                            {modelPermissions.map(permission => (
                              <label
                                key={permission.id}
                                className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                                  checked={formData.permissions.includes(permission.id)}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs md:text-sm font-medium text-gray-900 break-words">
                                    {permission.name}
                                  </p>
                                  <p className="text-xs text-gray-500 break-all">
                                    {permission.codename}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                disabled={loading || !formData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                {loading ? 'Creando...' : 'Crear Rol'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;