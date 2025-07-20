// src/pages/groups/ViewGroup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Edit, Users, Check, X } from 'lucide-react';
import { useGroup, usePermissions } from '../../hooks/useGroups';
import Button from '../../Components/common/Button';

const ViewGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { group, loading, error } = useGroup(id);
  const { permissions: allPermissions, loading: permissionsLoading } = usePermissions();
  const [enrichedPermissions, setEnrichedPermissions] = useState([]);

  const handleBack = () => {
    navigate('/groups');
  };

  const handleEdit = () => {
    navigate(`/groups/edit/${group.id}`);
  };

  useEffect(() => {
    if (group && group.permissions && allPermissions.length > 0) {
      const enriched = group.permissions.map(permId => {
        if (typeof permId === 'number') {
          return allPermissions.find(p => p.id === permId);
        }
        return permId;
      }).filter(Boolean);

      setEnrichedPermissions(enriched);
    }
  }, [group, allPermissions]);

  const groupedPermissions = enrichedPermissions.reduce((acc, permission) => {
    if (!permission || !permission.codename) return acc;
    
    const parts = permission.codename.split('_') || [];
    const model = parts.length > 1 ? parts[parts.length - 1] : 'otros';
    
    if (!acc[model]) {
      acc[model] = [];
    }
    acc[model].push(permission);
    return acc;
  }, {});

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium text-sm md:text-base">Cargando información del grupo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 m-4 md:m-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">!</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-semibold text-sm md:text-base">Error al cargar grupo</h3>
            <p className="text-red-600 text-xs md:text-sm">{error}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4 w-full md:w-auto">
          <ArrowLeft size={16} className="mr-2" />
          Volver a grupos
        </Button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6 m-4 md:m-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">?</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-yellow-800 font-semibold text-sm md:text-base">Grupo no encontrado</h3>
            <p className="text-yellow-600 text-xs md:text-sm">
              El grupo solicitado no existe o no tienes permisos para verlo.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4 w-full md:w-auto">
          <ArrowLeft size={16} className="mr-2" />
          Volver a grupos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </Button>
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Detalles del Rol</h1>
            <p className="text-gray-600 text-sm">Información completa del rol y sus permisos</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleEdit}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
        >
          <Edit size={16} />
          <span>Editar Rol</span>
        </Button>
      </div>

      {/* Group Profile Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gray-50 px-4 md:px-6 py-4 md:py-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{group.name}</h2>
              <p className="text-gray-600 text-sm md:text-base">ID: #{group.id}</p>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 mt-2">
                <div className="flex items-center space-x-1 text-xs md:text-sm text-gray-600">
                  <Lock className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{enrichedPermissions.length} Permisos</span>
                </div>
                <div className="flex items-center space-x-1 text-xs md:text-sm text-gray-600">
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{group.user_count || 0} Usuarios</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-500" />
            Permisos Asignados
          </h3>

          {enrichedPermissions.length > 0 ? (
            <div className="space-y-4 md:space-y-6">
              {Object.entries(groupedPermissions).map(([model, permissions]) => (
                <div key={model} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 md:px-4 py-2 md:py-3 border-b border-gray-200">
                    <h4 className="text-xs md:text-sm font-medium text-gray-900 flex items-center">
                      <Shield className="w-3 h-3 md:w-4 md:h-4 mr-2 text-gray-500" />
                      {model.toUpperCase()}
                    </h4>
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-3 p-2 md:p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 md:w-3 md:h-3 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-900 break-words">
                              {permission.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 break-all">
                              Código: {permission.codename}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              ID: #{permission.id}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
              </div>
              <h4 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                Sin Permisos Asignados
              </h4>
              <p className="text-gray-500 mb-4 text-sm md:text-base">
                Este rol no tiene permisos asignados actualmente.
              </p>
              <Button
                variant="primary"
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                <Edit size={16} className="mr-2" />
                Asignar Permisos
              </Button>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            Resumen del Rol
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Nombre</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 break-words">
                    {group.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Total Permisos</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {enrichedPermissions.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Usuarios</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {group.user_count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGroup;