// src/pages/clients/ClientsPage.jsx - CÓDIGO COMPLETO CORREGIDO
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Users, CreditCard, FileText, Home, DollarSign, Calendar, Filter, RotateCcw } from 'lucide-react';
import { useClients, useClientStatistics } from '../../hooks/useClients';
import Button from '../../Components/common/Button';

const ClientsPage = () => {
  const navigate = useNavigate();
  const { clients, loading, error, deleteClient, liberarHabitaciones, fetchClients } = useClients();
  const { statistics, loading: statsLoading } = useClientStatistics();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipoDocumento, setFilterTipoDocumento] = useState('');
  const [filterTipoPago, setFilterTipoPago] = useState('');
  
  // ✅ CAMBIO PRINCIPAL: Por defecto mostrar todos los clientes, no solo activos
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [soloActivos, setSoloActivos] = useState(false); // ✅ Cambio: false por defecto
  const [fechaIngresoDesde, setFechaIngresoDesde] = useState('');
  const [fechaIngresoHasta, setFechaIngresoHasta] = useState('');
  const [fechaSalidaDesde, setFechaSalidaDesde] = useState('');
  const [fechaSalidaHasta, setFechaSalidaHasta] = useState('');
  const [fechaEspecifica, setFechaEspecifica] = useState('');

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.numero_documento.includes(searchTerm) ||
      (client.telefono && client.telefono.includes(searchTerm)) ||
      (client.direccion && client.direccion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTipoDocumento = filterTipoDocumento === '' || client.tipo_documento === filterTipoDocumento;
    const matchesTipoPago = filterTipoPago === '' || client.tipo_pago === filterTipoPago;
    
    return matchesSearch && matchesTipoDocumento && matchesTipoPago;
  });

  const handleDeleteClient = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción también liberará las habitaciones asignadas y las marcará como sucias.')) {
      try {
        await deleteClient(id);
        alert('Cliente eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar cliente: ' + error.message);
      }
    }
  };

  // ✅ FUNCIÓN MEJORADA: Manejar liberación con mejor navegación
  const handleLiberarHabitaciones = async (id, nombreCompleto) => {
    if (window.confirm(`¿Estás seguro de que quieres liberar las habitaciones de ${nombreCompleto}?`)) {
      try {
        const result = await liberarHabitaciones(id);
        alert(result.message);
        
        // ✅ MEJORA: Mantener filtros actuales para ver el cliente liberado
        // No cambiar a solo activos automáticamente después de liberar
      } catch (error) {
        alert('Error al liberar habitaciones: ' + error.message);
      }
    }
  };

  const handleApplyDateFilters = async () => {
    try {
      const params = new URLSearchParams();
      
      // ✅ MEJORADO: Aplicar filtro de activos solo si está activado
      if (soloActivos) {
        params.append('solo_activos', 'true');
      } else {
        params.append('solo_activos', 'false');
      }
      
      if (fechaIngresoDesde) {
        params.append('fecha_ingreso_desde', fechaIngresoDesde);
      }
      
      if (fechaIngresoHasta) {
        params.append('fecha_ingreso_hasta', fechaIngresoHasta);
      }
      
      if (fechaSalidaDesde) {
        params.append('fecha_salida_desde', fechaSalidaDesde);
      }
      
      if (fechaSalidaHasta) {
        params.append('fecha_salida_hasta', fechaSalidaHasta);
      }
      
      if (fechaEspecifica) {
        params.append('fecha_especifica', fechaEspecifica);
      }
      
      await fetchClients(params.toString());
      
    } catch (error) {
      alert('Error al aplicar filtros: ' + error.message);
    }
  };

  const handleClearDateFilters = async () => {
    setFechaIngresoDesde('');
    setFechaIngresoHasta('');
    setFechaSalidaDesde('');
    setFechaSalidaHasta('');
    setFechaEspecifica('');
    setSoloActivos(false); // ✅ Volver a mostrar todos
    
    // ✅ MEJORADO: Recargar con filtro explícito
    await fetchClients('solo_activos=false');
  };

  // ✅ NUEVA FUNCIÓN: Cambio rápido entre modos
  const handleToggleActiveFilter = async (showOnlyActive) => {
    setSoloActivos(showOnlyActive);
    const params = new URLSearchParams();
    params.append('solo_activos', showOnlyActive.toString());
    await fetchClients(params.toString());
  };

  const handleCreateClient = () => {
    navigate('/clients/create');
  };

  const handleEditClient = (client) => {
    navigate(`/clients/edit/${client.id}`);
  };

  const handleViewClient = (client) => {
    navigate(`/clients/view/${client.id}`);
  };

  const getTipoDocumentoDisplay = (tipo) => {
    switch (tipo) {
      case 'DNI': return 'DNI';
      case 'pasaporte': return 'Pasaporte';
      case 'carnet_extranjeria': return 'Carnet Extranjería';
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // ✅ FUNCIÓN CORREGIDA: isClientActive usando los campos correctos del serializer
  const isClientActive = (client) => {
    // ✅ OPCIÓN 1: Usar el campo esta_activo que viene del backend
    if (typeof client.esta_activo === 'boolean') {
      console.log(`🔍 Cliente ${client.id} está activo (esta_activo): ${client.esta_activo}`);
      return client.esta_activo;
    }
    
    // ✅ OPCIÓN 2: Verificar habitaciones_activas en lugar de habitaciones_asignadas
    if (client.habitaciones_activas && Array.isArray(client.habitaciones_activas)) {
      const activo = client.habitaciones_activas.length > 0;
      console.log(`🔍 Cliente ${client.id} está activo (habitaciones_activas): ${activo} (${client.habitaciones_activas.length} habitaciones)`);
      return activo;
    }
    
    // ✅ FALLBACK: Verificar habitaciones_asignadas (método anterior - menos confiable)
    if (client.habitaciones_asignadas && Array.isArray(client.habitaciones_asignadas)) {
      const activo = client.habitaciones_asignadas.length > 0;
      console.log(`⚠️ Cliente ${client.id} usando fallback (habitaciones_asignadas): ${activo} (${client.habitaciones_asignadas.length} habitaciones)`);
      return activo;
    }
    
    // ✅ DEFAULT: Si no hay información, asumir inactivo
    console.log(`❌ Cliente ${client.id} sin información de habitaciones - marcando como inactivo`);
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Cargando clientes...</p>
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
            <h3 className="text-red-800 font-semibold">Error al cargar clientes</h3>
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 text-sm">
            Gestiona los clientes del hotel
            {soloActivos ? ' - Mostrando solo clientes activos' : ' - Mostrando todos los clientes'}
          </p>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_clients}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Con Habitaciones</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.clients_con_habitaciones}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Recaudado</p>
                  <p className="text-lg font-bold text-purple-600">
                    S/ {statistics.monto_total_recaudado?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Promedio Hab.</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {statistics.promedio_habitaciones_por_client?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ MEJORADO: Controles de filtro más claros */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Filtros de Visualización
            </h3>
            <button
              onClick={() => setShowDateFilters(!showDateFilters)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showDateFilters ? 'Ocultar' : 'Mostrar'} Filtros Avanzados
            </button>
          </div>

          {/* ✅ NUEVO: Filtros rápidos */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleToggleActiveFilter(false)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !soloActivos 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos los clientes
            </button>
            <button
              onClick={() => handleToggleActiveFilter(true)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                soloActivos 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Solo activos (hospedados)
            </button>
          </div>

          {showDateFilters && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clientes hospedados en fecha específica
                  </label>
                  <input
                    type="date"
                    value={fechaEspecifica}
                    onChange={(e) => setFechaEspecifica(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de ingreso desde
                  </label>
                  <input
                    type="date"
                    value={fechaIngresoDesde}
                    onChange={(e) => setFechaIngresoDesde(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de ingreso hasta
                  </label>
                  <input
                    type="date"
                    value={fechaIngresoHasta}
                    onChange={(e) => setFechaIngresoHasta(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de salida desde
                  </label>
                  <input
                    type="date"
                    value={fechaSalidaDesde}
                    onChange={(e) => setFechaSalidaDesde(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de salida hasta
                  </label>
                  <input
                    type="date"
                    value={fechaSalidaHasta}
                    onChange={(e) => setFechaSalidaHasta(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplyDateFilters}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Filter className="h-4 w-4" />
                  <span>Aplicar Filtros</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearDateFilters}
                  className="flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Limpiar Filtros</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0 md:space-x-4">
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3 flex-1">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, documento o dirección..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filterTipoDocumento}
              onChange={(e) => setFilterTipoDocumento(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos los documentos</option>
              <option value="DNI">DNI</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="carnet_extranjeria">Carnet Extranjería</option>
            </select>

            <select
              value={filterTipoPago}
              onChange={(e) => setFilterTipoPago(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos los pagos</option>
              <option value="efectivo">Efectivo</option>
              <option value="billetera_digital">Billetera Digital</option>
              <option value="visa">Visa</option>
            </select>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateClient}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Cliente</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Habitaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron clientes</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {soloActivos 
                        ? 'No hay clientes activos o intenta con diferentes términos de búsqueda.'
                        : 'Intenta con diferentes términos de búsqueda o ajusta los filtros.'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* ✅ AVATAR CORREGIDO: usando isClientActive corregido */}
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isClientActive(client) 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            <span className="text-sm font-medium text-white">
                              {client.nombres.charAt(0)}{client.apellidos.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.nombres} {client.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.telefono ? `Tel: ${client.telefono}` : 'Sin teléfono'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{getTipoDocumentoDisplay(client.tipo_documento)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.numero_documento}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{client.numero_habitaciones_deseadas}</span> deseadas
                        </div>
                      </div>
                      {/* ✅ CORREGIDO: usar habitaciones_activas en lugar de habitaciones_asignadas */}
                      <div className="text-sm text-gray-500">
                        {client.habitaciones_activas?.length || 0} activas
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">S/ {parseFloat(client.monto_pagado || 0).toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {getTipoPagoDisplay(client.tipo_pago)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Ingreso: {formatDate(client.fecha_ingreso)}</div>
                      <div>Salida: {formatDate(client.fecha_salida)}</div>
                      {client.fecha_salida_real && (
                        <div className="text-xs text-green-600 font-medium">
                          Salió: {formatDate(client.fecha_salida_real)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* ✅ ESTADO CORREGIDO: usando isClientActive corregido */}
                      {isClientActive(client) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          Hospedado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                          Retirado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewClient(client)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Editar cliente"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {/* ✅ BOTÓN LIBERAR CORREGIDO: usando isClientActive corregido */}
                        {isClientActive(client) && (
                          <button
                            onClick={() => handleLiberarHabitaciones(client.id, client.nombre_completo)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Liberar habitaciones"
                          >
                            <Home className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-xs text-gray-500 px-1 flex justify-between items-center">
        <span>
          Mostrando {filteredClients.length} de {clients.length} clientes
          {soloActivos && ' (solo activos)'}
        </span>
        {!soloActivos && (
          <span className="text-blue-600">
            Mostrando historial completo
          </span>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;