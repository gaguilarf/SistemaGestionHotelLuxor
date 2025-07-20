// src/pages/users/UsersPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Users, UserCheck } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import Button from '../../Components/common/Button';

const UsersPage = () => {
  const navigate = useNavigate();
  const { users, loading, error, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.dni && user.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(id);
        alert('Usuario eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar usuario: ' + error.message);
      }
    }
  };

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const handleEditUser = (user) => {
    navigate(`/users/edit/${user.id}`);
  };

  const handleViewUser = (user) => {
    navigate(`/users/view/${user.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Cargando usuarios...</p>
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
            <h3 className="text-red-800 font-semibold">Error al cargar usuarios</h3>
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 text-sm">Gestiona los usuarios del sistema</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuarios..."
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
              onClick={handleCreateUser}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">USUARIO</div>
              <div className="col-span-3 text-center">EMAIL</div>
              <div className="col-span-2 text-center">GRUPO</div>
              <div className="col-span-2 text-center">ESTADO</div>
              <div className="col-span-2 text-center">ACCIONES</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Intenta con diferentes términos de búsqueda o crea un nuevo usuario.
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Usuario */}
                    <div className="col-span-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-medium text-xs">
                          {user.first_name?.[0] || user.username?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3 text-center">
                      <span className="text-sm text-gray-900 truncate block">{user.email}</span>
                    </div>

                    {/* Grupo */}
                    <div className="col-span-2 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {user.group_name || user.groups?.[0] || 'Sin grupo'}
                      </span>
                    </div>

                    {/* Estado */}
                    <div className="col-span-2 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="col-span-2 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar usuario"
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
        {filteredUsers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
            <p className="mt-2 text-sm text-gray-500">
              Intenta con diferentes términos de búsqueda o crea un nuevo usuario.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-medium text-xs">
                      {user.first_name?.[0] || user.username?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {user.group_name || user.groups?.[0] || 'Sin grupo'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-3">
                  <button
                    onClick={() => handleViewUser(user)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Editar usuario"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar usuario"
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
        Mostrando {filteredUsers.length} de {users.length} usuarios
      </div>
    </div>
  );
};

export default UsersPage;