// src/pages/rooms/RoomsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Bed, Settings, RefreshCw } from 'lucide-react';
import { useRooms, useRoomStatistics } from '../../hooks/useRooms';
import Button from '../../Components/common/Button';

const RoomsPage = () => {
  const navigate = useNavigate();
  const { rooms, loading, error, deleteRoom, changeRoomStatus } = useRooms();
  const { statistics, loading: statsLoading } = useRoomStatistics();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' o 'list'

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.numero.toString().includes(searchTerm) ||
                         (room.descripcion && room.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === '' || room.estado === filterStatus;
    const matchesType = filterType === '' || room.tipo === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteRoom = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      try {
        await deleteRoom(id);
        alert('Habitación eliminada exitosamente');
      } catch (error) {
        alert('Error al eliminar habitación: ' + error.message);
      }
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await changeRoomStatus(id, newStatus);
      alert('Estado actualizado exitosamente');
    } catch (error) {
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const handleCreateRoom = () => {
    navigate('/rooms/create');
  };

  const handleEditRoom = (room) => {
    navigate(`/rooms/edit/${room.id}`);
  };

  const handleViewRoom = (room) => {
    navigate(`/rooms/view/${room.id}`);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-500';
      case 'ocupado':           // Nuevo estado
        return 'bg-yellow-500';
      case 'sucio':
        return 'bg-blue-500';
      case 'mantenimiento':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'DISPONIBLE';
      case 'ocupado':           // Nuevo estado
        return 'OCUPADO';
      case 'sucio':
        return 'SUCIO';
      case 'mantenimiento':
        return 'MANTENIMIENTO';
      default:
        return estado.toUpperCase();
    }
  };

  const getTypeIcon = (tipo) => {
    return <Bed className="h-8 w-8 text-white" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Cargando habitaciones...</p>
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
            <h3 className="text-red-800 font-semibold">Error al cargar habitaciones</h3>
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Habitaciones</h1>
          <p className="text-gray-600 text-sm">Gestiona las habitaciones del hotel</p>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bed className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.disponibles}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Bed className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Ocupadas</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.ocupadas || 0}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Bed className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Sucias</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.sucias}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bed className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Mantenimiento</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.mantenimiento}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0 md:space-x-4">
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3 flex-1">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por número o descripción..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="ocupado">Ocupado</option>
              <option value="sucio">Sucio</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="simple">Simple</option>
              <option value="doble">Doble</option>
              <option value="triple">Triple</option>
              <option value="familiar">Familiar</option>
            </select>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateRoom}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Habitación</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Bed className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron habitaciones</h3>
            <p className="mt-2 text-sm text-gray-500">
              Intenta con diferentes términos de búsqueda o crea una nueva habitación.
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.id}
              className={`relative bg-white border-2 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${
                room.estado === 'disponible' ? 'border-green-200 hover:border-green-300' :
                room.estado === 'ocupado' ? 'border-yellow-200 hover:border-yellow-300' :
                room.estado === 'sucio' ? 'border-blue-200 hover:border-blue-300' :
                'border-red-200 hover:border-red-300'
              }`}
              onClick={() => handleViewRoom(room)}
            >
                {/* Room Header */}
                <div className={`${getStatusColor(room.estado)} p-3 text-center relative`}>
                  {getTypeIcon(room.tipo)}
                  {/* Botones siempre visibles */}
                  <div className="absolute top-2 right-2">
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRoom(room);
                        }}
                        className="p-1 bg-white bg-opacity-80 rounded text-gray-700 hover:bg-opacity-100 shadow-sm"
                        title="Editar habitación"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room.id);
                        }}
                        className="p-1 bg-red-500 bg-opacity-80 rounded text-white hover:bg-opacity-100 shadow-sm"
                        title="Eliminar habitación"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

              {/* Room Info */}
              <div className="p-3">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">{room.numero}</h3>
                  <p className="text-xs text-gray-600 capitalize mb-2">{room.tipo_display || room.tipo}</p>
                  
                  {/* Status Badge */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(room.estado)} mb-2`}>
                    {getStatusText(room.estado)}
                  </div>
                  
                  {/* Price */}
                  <p className="text-sm font-semibold text-gray-900">
                    S/ {parseFloat(room.precio_noche).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">por noche</p>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex justify-center space-x-1">
                  {room.estado !== 'disponible' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(room.id, 'disponible');
                      }}
                      className="p-1 text-green-600 hover:bg-green-50 rounded text-xs"
                      title="Marcar como disponible"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                  {room.estado !== 'ocupado' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(room.id, 'ocupado');
                      }}
                      className="p-1 text-yellow-600 hover:bg-yellow-50 rounded text-xs"
                      title="Marcar como ocupado"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                  {room.estado !== 'sucio' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(room.id, 'sucio');
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                      title="Marcar como sucio"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                  {room.estado !== 'mantenimiento' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(room.id, 'mantenimiento');
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
                      title="Marcar en mantenimiento"
                    >
                      <Settings className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="text-xs text-gray-500 px-1">
        Mostrando {filteredRooms.length} de {rooms.length} habitaciones
      </div>
    </div>
  );
};

export default RoomsPage;