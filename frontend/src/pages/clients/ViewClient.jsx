// src/pages/clients/ViewClient.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User, FileText, CreditCard, Home, Calendar, Edit, MapPin, Phone,
  Clock, History, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useClient, useClientRooms } from '../../hooks/useClients';
import Button from '../../Components/common/Button';

const ViewClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { client, loading, error } = useClient(id);
  const { clientRooms } = useClientRooms(id);
  
  // ✅ NUEVO: Estado para alternar entre habitaciones activas e historial
  const [showActiveRooms, setShowActiveRooms] = useState(true);

  const handleBack = () => {
    navigate('/clients');
  };

  const handleEdit = () => {
    navigate(`/clients/edit/${client.id}`);
  };

  const getTipoDocumentoDisplay = (tipo) => {
    switch (tipo) {
      case 'DNI': return 'DNI';
      case 'pasaporte': return 'Pasaporte';
      case 'carnet_extranjeria': return 'Carnet de Extranjería';
      default: return tipo;
    }
  };

  const getTipoPagoDisplay = (tipo) => {
    switch (tipo) {
      case 'efectivo': return 'Efectivo';
      case 'billetera_digital': return 'Billetera Digital';
      case 'visa': return 'Visa';
      default: return tipo;
    }
  };

  const getTipoPagoColor = (tipo) => {
    switch (tipo) {
      case 'efectivo': return 'text-green-600 bg-green-100';
      case 'billetera_digital': return 'text-blue-600 bg-blue-100';
      case 'visa': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // ✅ FUNCIÓN ACTUALIZADA: Colores para estados de habitaciones
  const getRoomStatusColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'text-green-600 bg-green-100';
      case 'ocupado':
        return 'text-yellow-600 bg-yellow-100';
      case 'sucio':
        return 'text-blue-600 bg-blue-100';
      case 'mantenimiento':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // ✅ NUEVA FUNCIÓN: Colores para estados de asignación (activo/liberado)
  const getAssignmentStatusColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'text-green-600 bg-green-100';
      case 'liberado':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoomStatusDisplay = (estado) => {
    switch (estado) {
      case 'disponible': return 'Disponible';
      case 'ocupado': return 'Ocupado';
      case 'sucio': return 'Sucio';
      case 'mantenimiento': return 'Mantenimiento';
      default: return estado;
    }
  };

  // ✅ NUEVA FUNCIÓN: Display para estados de asignación
  const getAssignmentStatusDisplay = (estado) => {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'liberado': return 'Liberado';
      default: return estado;
    }
  };

  const getRoomIconColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-500';
      case 'ocupado':
        return 'bg-yellow-500';
      case 'sucio':
        return 'bg-blue-500';
      case 'mantenimiento':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // ✅ NUEVA FUNCIÓN: Iconos para estados de asignación
  const getAssignmentIcon = (estado) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'liberado':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
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

  const formatDateShort = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
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
          <p className="text-gray-600 font-medium text-sm md:text-base">Cargando información del cliente...</p>
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
            <h3 className="text-red-800 font-semibold text-sm md:text-base">Error al cargar cliente</h3>
            <p className="text-red-600 text-xs md:text-sm">{error}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4 w-full md:w-auto">
          <ArrowLeft size={16} className="mr-2" />
          Volver a clientes
        </Button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6 m-4 md:m-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">?</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-yellow-800 font-semibold text-sm md:text-base">Cliente no encontrado</h3>
            <p className="text-yellow-600 text-xs md:text-sm">
              El cliente solicitado no existe o no tienes permisos para verlo.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4 w-full md:w-auto">
          <ArrowLeft size={16} className="mr-2" />
          Volver a clientes
        </Button>
      </div>
    );
  }

  // ✅ NUEVAS VARIABLES: Separar habitaciones activas e historial
  const habitacionesActivas = client.habitaciones_activas || [];
  const historialHabitaciones = client.historial_habitaciones || [];
  const clienteEstaActivo = client.esta_activo || habitacionesActivas.length > 0;

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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Detalles del Cliente</h1>
            <p className="text-gray-600 text-sm">Información completa del cliente</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleEdit}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
        >
          <Edit size={16} />
          <span>Editar Cliente</span>
        </Button>
      </div>

      {/* Client Profile Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gray-50 px-4 md:px-6 py-4 md:py-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl md:text-2xl font-bold text-white">
                {client.nombres.charAt(0)}{client.apellidos.charAt(0)}
              </span>
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{client.nombre_completo}</h2>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2 md:mt-0">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTipoPagoColor(client.tipo_pago)}`}>
                    {getTipoPagoDisplay(client.tipo_pago)}
                  </div>
                  {/* ✅ NUEVO: Badge de estado del cliente */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    clienteEstaActivo 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {clienteEstaActivo ? '🟢 Activo' : '🔴 Inactivo'}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                {getTipoDocumentoDisplay(client.tipo_documento)}: {client.numero_documento} • ID: #{client.id}
              </p>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-6 mt-3">
                <div className="flex items-center space-x-2 text-lg md:text-xl font-bold text-gray-900">
                  <CreditCard className="h-5 w-5" />
                  <span>S/ {parseFloat(client.monto_pagado || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Home className="h-4 w-4" />
                  <span>{habitacionesActivas.length}/{client.numero_habitaciones_deseadas} habitaciones activas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-500" />
                Información Personal
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Nombres:</span>
                  <span className="text-sm font-semibold text-gray-900">{client.nombres}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Apellidos:</span>
                  <span className="text-sm font-semibold text-gray-900">{client.apellidos}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Documento:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {getTipoDocumentoDisplay(client.tipo_documento)} - {client.numero_documento}
                  </span>
                </div>
                
                {client.edad && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Edad:</span>
                    <span className="text-sm font-semibold text-gray-900">{client.edad} años</span>
                  </div>
                )}
                
                {client.telefono && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                    <span className="text-sm font-semibold text-gray-900 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {client.telefono}
                    </span>
                  </div>
                )}
                
                {client.direccion && (
                  <div className="flex justify-between items-start py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Dirección:</span>
                    <span className="text-sm font-semibold text-gray-900 text-right flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{client.direccion}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Reserva */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                Información de Reserva
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Estado:</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    clienteEstaActivo 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {clienteEstaActivo ? 'Hospedado' : 'No hospedado'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Habitaciones deseadas:</span>
                  <span className="text-sm font-semibold text-gray-900">{client.numero_habitaciones_deseadas}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Habitaciones activas:</span>
                  <span className="text-sm font-semibold text-gray-900">{habitacionesActivas.length}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Total en historial:</span>
                  <span className="text-sm font-semibold text-gray-900">{historialHabitaciones.length}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Tipo de pago:</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getTipoPagoColor(client.tipo_pago)}`}>
                    {getTipoPagoDisplay(client.tipo_pago)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Monto pagado:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    S/ {parseFloat(client.monto_pagado || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Fecha de ingreso:</span>
                  <span className="text-sm text-gray-900 text-right">
                    {formatDateShort(client.fecha_ingreso)}
                  </span>
                </div>
                
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Fecha de salida planeada:</span>
                  <span className="text-sm text-gray-900 text-right">
                    {formatDateShort(client.fecha_salida)}
                  </span>
                </div>
                
                {client.fecha_salida_real && (
                  <div className="flex justify-between items-start py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Fecha de salida real:</span>
                    <span className="text-sm text-green-600 font-semibold text-right">
                      {formatDateShort(client.fecha_salida_real)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Registrado:</span>
                  <span className="text-sm text-gray-900 text-right">
                    {formatDateShort(client.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ SECCIÓN ACTUALIZADA: Habitaciones con toggle entre activas e historial */}
          {historialHabitaciones && historialHabitaciones.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {/* Header con toggle */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-3 md:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-gray-500" />
                  Habitaciones del Cliente
                </h3>
                
                {/* Toggle buttons */}
                <div className="flex bg-gray-100 rounded-lg p-1 w-full md:w-auto">
                  <button
                    onClick={() => setShowActiveRooms(true)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none justify-center ${
                      showActiveRooms
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <CheckCircle size={16} />
                    <span>Activas ({habitacionesActivas.length})</span>
                  </button>
                  <button
                    onClick={() => setShowActiveRooms(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 md:flex-none justify-center ${
                      !showActiveRooms
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <History size={16} />
                    <span>Historial ({historialHabitaciones.length})</span>
                  </button>
                </div>
              </div>

              {/* Habitaciones Activas */}
              {showActiveRooms && (
                <div>
                  {habitacionesActivas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {habitacionesActivas.map((assignment) => (
                        <div key={assignment.id} className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRoomIconColor(assignment.room.estado)}`}>
                                <Home className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">Habitación {assignment.room.numero}</p>
                                <p className="text-xs text-gray-600 capitalize">{assignment.room.tipo}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoomStatusColor(assignment.room.estado)}`}>
                                {getRoomStatusDisplay(assignment.room.estado)}
                              </span>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getAssignmentStatusColor(assignment.estado)}`}>
                                {getAssignmentIcon(assignment.estado)}
                                <span className="ml-1">{getAssignmentStatusDisplay(assignment.estado)}</span>
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>💰 Precio: S/ {parseFloat(assignment.room.precio_noche).toFixed(2)}/noche</p>
                            <p>📅 Asignada: {formatDateShort(assignment.fecha_asignacion)}</p>
                            {assignment.fecha_liberacion && (
                              <p>🔓 Liberada: {formatDateShort(assignment.fecha_liberacion)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Sin habitaciones activas</p>
                      <p className="text-gray-500 text-sm">El cliente no tiene habitaciones asignadas actualmente</p>
                    </div>
                  )}
                </div>
              )}

              {/* Historial Completo */}
              {!showActiveRooms && (
                <div>
                  {historialHabitaciones.length > 0 ? (
                    <div className="space-y-3">
                      {historialHabitaciones.map((assignment) => (
                        <div 
                          key={assignment.id} 
                          className={`rounded-lg p-4 border ${
                            assignment.estado === 'activo' 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center space-x-3 mb-3 md:mb-0">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRoomIconColor(assignment.room.estado)}`}>
                                <Home className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">Habitación {assignment.room.numero}</p>
                                <p className="text-sm text-gray-600 capitalize">{assignment.room.tipo} • S/ {parseFloat(assignment.room.precio_noche).toFixed(2)}/noche</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoomStatusColor(assignment.room.estado)}`}>
                                  {getRoomStatusDisplay(assignment.room.estado)}
                                </span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${getAssignmentStatusColor(assignment.estado)}`}>
                                  {getAssignmentIcon(assignment.estado)}
                                  <span className="ml-1">{getAssignmentStatusDisplay(assignment.estado)}</span>
                                </span>
                              </div>
                              
                              <div className="text-xs text-gray-600 text-right">
                                <p>📅 Asignada: {formatDateShort(assignment.fecha_asignacion)}</p>
                                {assignment.fecha_liberacion && (
                                  <p>🔓 Liberada: {formatDateShort(assignment.fecha_liberacion)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Sin historial de habitaciones</p>
                      <p className="text-gray-500 text-sm">El cliente no tiene habitaciones en su historial</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ✅ SUMMARY SECTION ACTUALIZADA */}
        <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen del Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="text-sm font-semibold text-gray-900">#{client.id}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Documento</p>
                  <p className="text-sm font-semibold text-gray-900">{client.tipo_documento}</p>
                </div>
              </div>
            </div>

            {/* ✅ NUEVO: Card de estado */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  clienteEstaActivo ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {clienteEstaActivo ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {clienteEstaActivo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ ACTUALIZADO: Card de habitaciones activas */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Habitaciones Activas</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {habitacionesActivas.length}/{client.numero_habitaciones_deseadas}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pagado</p>
                  <p className="text-sm font-semibold text-gray-900">
                    S/ {parseFloat(client.monto_pagado || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* ✅ NUEVA SECCIÓN: Estadísticas adicionales */}
          {historialHabitaciones.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <History className="w-4 h-4 mr-2" />
                Estadísticas de Habitaciones
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{historialHabitaciones.length}</p>
                  <p className="text-xs text-gray-500">Total asignadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{habitacionesActivas.length}</p>
                  <p className="text-xs text-gray-500">Actualmente activas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {historialHabitaciones.filter(h => h.estado === 'liberado').length}
                  </p>
                  <p className="text-xs text-gray-500">Liberadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {historialHabitaciones.reduce((total, h) => total + parseFloat(h.room.precio_noche), 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500">Valor total/noche</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewClient;