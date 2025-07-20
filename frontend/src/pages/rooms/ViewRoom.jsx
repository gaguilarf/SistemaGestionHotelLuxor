// src/pages/rooms/ViewRoom.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bed, DollarSign, Home, FileText, Edit, Calendar, Clock, Settings } from 'lucide-react';
import { useRoom } from '../../hooks/useRooms';
import Button from '../../Components/common/Button';

const ViewRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { room, loading, error } = useRoom(id);

  const handleBack = () => {
    navigate('/rooms');
  };

  const handleEdit = () => {
    navigate(`/rooms/edit/${room.id}`);
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

  const getStatusTextColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'text-green-600';
      case 'ocupado':           // Nuevo estado
        return 'text-yellow-600';
      case 'sucio':
        return 'text-blue-600';
      case 'mantenimiento':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'Disponible';
      case 'ocupado':           // Nuevo estado
        return 'Ocupado';
      case 'sucio':
        return 'Sucio';
      case 'mantenimiento':
        return 'En Mantenimiento';
      default:
        return estado;
    }
  };

  const getTypeLabel = (tipo) => {
    switch (tipo) {
      case 'simple':
        return 'Simple';
      case 'doble':
        return 'Doble';
      case 'triple':
        return 'Triple';
      case 'familiar':
        return 'Familiar (4 camas)';
      default:
        return tipo;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium text-sm md:text-base">Cargando información de la habitación...</p>
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
            <h3 className="text-red-800 font-semibold text-sm md:text-base">Error al cargar habitación</h3>
            <p className="text-red-600 text-xs md:text-sm">{error}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4 w-full md:w-auto">
          <ArrowLeft size={16} className="mr-2" />
          Volver a habitaciones
        </Button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6 m-4 md:m-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">?</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-yellow-800 font-semibold text-sm md:text-base">Habitación no encontrada</h3>
            <p className="text-yellow-600 text-xs md:text-sm">
              La habitación solicitada no existe o no tienes permisos para verla.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4 w-full md:w-auto">
          <ArrowLeft size={16} className="mr-2" />
          Volver a habitaciones
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Detalles de la Habitación</h1>
            <p className="text-gray-600 text-sm">Información completa de la habitación</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleEdit}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
        >
          <Edit size={16} />
          <span>Editar Habitación</span>
        </Button>
      </div>

      {/* Room Profile Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gray-50 px-4 md:px-6 py-4 md:py-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className={`w-16 h-16 md:w-20 md:h-20 ${getStatusColor(room.estado)} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Bed className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Habitación {room.numero}</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(room.estado)} text-white mt-2 md:mt-0`}>
                  {getStatusText(room.estado).toUpperCase()}
                </div>
              </div>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                {getTypeLabel(room.tipo)} • ID: #{room.id}
              </p>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-6 mt-3">
                <div className="flex items-center space-x-2 text-lg md:text-xl font-bold text-gray-900">
                  <DollarSign className="h-5 w-5" />
                  <span>S/ {parseFloat(room.precio_noche || 0).toFixed(2)}</span>
                  <span className="text-sm font-normal text-gray-500">por noche</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Home className="w-5 h-5 mr-2 text-gray-500" />
                Información Básica
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Número:</span>
                  <span className="text-sm font-semibold text-gray-900">{room.numero}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Tipo:</span>
                  <span className="text-sm font-semibold text-gray-900">{getTypeLabel(room.tipo)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Estado:</span>
                  <span className={`text-sm font-semibold ${getStatusTextColor(room.estado)}`}>
                    {getStatusText(room.estado)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Precio por noche:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    S/ {parseFloat(room.precio_noche || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                Información de Registro
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Creado:</span>
                  <span className="text-sm text-gray-900 text-right">
                    {formatDate(room.created_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Última actualización:</span>
                  <span className="text-sm text-gray-900 text-right">
                    {formatDate(room.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {room.descripcion && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                Descripción
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {room.descripcion}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen de la Habitación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Número</p>
                  <p className="text-sm font-semibold text-gray-900">{room.numero}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bed className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo</p>
                  <p className="text-sm font-semibold text-gray-900 break-words">{getTypeLabel(room.tipo)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getStatusColor(room.estado)} bg-opacity-20 rounded-lg flex items-center justify-center`}>
                  <Settings className={`w-5 h-5 ${getStatusTextColor(room.estado)}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className={`text-sm font-semibold ${getStatusTextColor(room.estado)}`}>
                    {getStatusText(room.estado)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Precio</p>
                  <p className="text-sm font-semibold text-gray-900">
                    S/ {parseFloat(room.precio_noche || 0).toFixed(2)}
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

export default ViewRoom;