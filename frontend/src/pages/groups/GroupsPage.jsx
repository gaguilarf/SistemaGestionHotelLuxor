// src/pages/groups/GroupsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Shield } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import Button from '../../Components/common/Button';

const GroupsPage = () => {
  const navigate = useNavigate();
  const { groups, loading, error, deleteGroup } = useGroups();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter(group =>
    group.name && group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteGroup = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      try {
        await deleteGroup(id);
        alert('Grupo eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar grupo: ' + error.message);
      }
    }
  };

  const handleCreateGroup = () => {
    navigate('/groups/create');
  };

  const handleEditGroup = (group) => {
    navigate(`/groups/edit/${group.id}`);
  };

  const handleViewGroup = (group) => {
    navigate(`/groups/view/${group.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Cargando grupos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-semibold">Error al cargar grupos</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-gray-600 text-sm">Gestiona los roles y permisos del sistema</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre de rol..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <span>Filtros</span>
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateGroup}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Rol</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>ROL</div>
              <div className="text-center">PERMISOS</div>
              <div className="text-center">ACCIONES</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredGroups.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron roles</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Intenta con diferentes términos de búsqueda o crea un nuevo rol.
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Rol - Alineado a la izquierda */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{group.name}</span>
                    </div>

                    {/* Permisos - Centrado */}
                    <div className="flex justify-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {group.permissions && group.permissions.length ? group.permissions.length : 0} permisos
                      </span>
                    </div>

                    {/* Acciones - Centrado */}
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewGroup(group)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Editar rol"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar rol"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron roles</h3>
            <p className="text-sm text-gray-500">
              Intenta con diferentes términos de búsqueda o crea un nuevo rol.
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{group.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {group.permissions && group.permissions.length ? group.permissions.length : 0} permisos
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-3">
                  <button
                    onClick={() => handleViewGroup(group)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Editar rol"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar rol"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="text-xs text-gray-500 px-1">
        Mostrando {filteredGroups.length} de {groups.length} roles
      </div>
    </div>
  );
};

export default GroupsPage;