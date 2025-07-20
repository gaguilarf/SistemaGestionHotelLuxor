// src/pages/clients/CreateClient.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, CreditCard, Home, Calendar, Check, AlertCircle, Bed, Info } from 'lucide-react';
import { useClients, useCheckDocument, useAvailableRooms } from '../../hooks/useClients';
import Button from '../../Components/common/Button';

const CreateClient = () => {
  const navigate = useNavigate();
  const { createClient } = useClients();
  const { checkDocument, checking } = useCheckDocument();
  const { availableRooms } = useAvailableRooms();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipo_documento: '',
    numero_documento: '',
    edad: '',
    telefono: '',
    direccion: '',
    fecha_ingreso: '',
    fecha_salida: '',
    numero_habitaciones_deseadas: 1,
    tipo_pago: '',
    monto_pagado: '',
    habitaciones_seleccionadas: []
  });

  const [errors, setErrors] = useState({});
  // ✅ NUEVO ESTADO: Para manejar la validación inteligente de documentos
  const [documentValidation, setDocumentValidation] = useState({
    available: null,
    reason: null,
    message: '',
    clientInfo: null
  });
  const [selectedRooms, setSelectedRooms] = useState([]);

  const tipoDocumentoChoices = [
    { value: 'DNI', label: 'DNI' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'carnet_extranjeria', label: 'Carnet de extranjería' }
  ];

  const tipoPagoChoices = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'billetera_digital', label: 'Billetera digital' },
    { value: 'visa', label: 'Visa' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validaciones de campos obligatorios
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.tipo_documento) {
      newErrors.tipo_documento = 'El tipo de documento es requerido';
    }

    if (!formData.numero_documento.trim()) {
      newErrors.numero_documento = 'El número de documento es requerido';
    } else {
      // Validar formato según tipo de documento
      if (formData.tipo_documento === 'DNI') {
        if (!/^\d{8}$/.test(formData.numero_documento)) {
          newErrors.numero_documento = 'El DNI debe tener exactamente 8 dígitos';
        }
      } else if (['pasaporte', 'carnet_extranjeria'].includes(formData.tipo_documento)) {
        if (formData.numero_documento.length > 30) {
          newErrors.numero_documento = 'El documento debe tener máximo 30 caracteres';
        }
      }
    }

    if (!formData.numero_habitaciones_deseadas || formData.numero_habitaciones_deseadas <= 0) {
      newErrors.numero_habitaciones_deseadas = 'Debe desear al menos 1 habitación';
    }

    if (!formData.tipo_pago) {
      newErrors.tipo_pago = 'El tipo de pago es requerido';
    }

    if (!formData.monto_pagado || parseFloat(formData.monto_pagado) <= 0) {
      newErrors.monto_pagado = 'El monto pagado es requerido y debe ser mayor a 0';
    }

    // Validar habitaciones seleccionadas
    if (selectedRooms.length !== parseInt(formData.numero_habitaciones_deseadas)) {
      newErrors.habitaciones_seleccionadas = 
        `Debe seleccionar exactamente ${formData.numero_habitaciones_deseadas} habitaciones`;
    }

    // ✅ VALIDACIÓN INTELIGENTE: Solo bloquear si hay un cliente activo
    if (documentValidation.available === false && documentValidation.reason === 'cliente_activo') {
      newErrors.numero_documento = 'Este documento pertenece a un cliente que está actualmente hospedado';
    }

    // Validar fechas
    if (formData.fecha_ingreso && formData.fecha_salida) {
      const fechaIngreso = new Date(formData.fecha_ingreso);
      const fechaSalida = new Date(formData.fecha_salida);
      
      if (fechaSalida <= fechaIngreso) {
        newErrors.fecha_salida = 'La fecha de salida debe ser posterior a la fecha de ingreso';
      }
    }

    // Validaciones opcionales
    if (formData.edad && (parseInt(formData.edad) <= 0 || parseInt(formData.edad) > 120)) {
      newErrors.edad = 'La edad debe estar entre 1 y 120 años';
    }

    if (formData.telefono && (formData.telefono.length < 7 || formData.telefono.length > 15 || !/^\d+$/.test(formData.telefono))) {
      newErrors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const clientData = {
        ...formData,
        numero_habitaciones_deseadas: parseInt(formData.numero_habitaciones_deseadas),
        monto_pagado: parseFloat(formData.monto_pagado),
        edad: formData.edad ? parseInt(formData.edad) : null,
        habitaciones_seleccionadas: selectedRooms
      };

      await createClient(clientData);
      alert('Cliente registrado exitosamente');
      navigate('/clients');
    } catch (error) {
      alert('Error al registrar cliente: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    // ✅ VALIDACIÓN INTELIGENTE: Verificar disponibilidad del documento
    if (field === 'numero_documento' || field === 'tipo_documento') {
      const tipoDoc = field === 'tipo_documento' ? value : formData.tipo_documento;
      const numDoc = field === 'numero_documento' ? value : formData.numero_documento;
      
      if (tipoDoc && numDoc && numDoc.length > 0) {
        checkDocumentAvailability(tipoDoc, numDoc);
      } else {
        setDocumentValidation({
          available: null,
          reason: null,
          message: '',
          clientInfo: null
        });
      }
    }

    // Reset selected rooms when numero_habitaciones_deseadas changes
    if (field === 'numero_habitaciones_deseadas') {
      setSelectedRooms([]);
      setFormData(prev => ({ ...prev, habitaciones_seleccionadas: [] }));
    }
  };

  // ✅ FUNCIÓN ACTUALIZADA: Validación inteligente de documentos
  const checkDocumentAvailability = async (tipoDocumento, numeroDocumento) => {
    try {
      const result = await checkDocument(tipoDocumento, numeroDocumento);
      setDocumentValidation({
        available: result.disponible,
        reason: result.razon,
        message: result.message,
        clientInfo: result.cliente_existente || result.cliente_anterior || null
      });
    } catch (error) {
      console.error('Error checking document:', error);
      setDocumentValidation({
        available: null,
        reason: null,
        message: 'Error al verificar documento',
        clientInfo: null
      });
    }
  };

  const handleRoomSelection = (roomId) => {
    const maxRooms = parseInt(formData.numero_habitaciones_deseadas);
    
    if (selectedRooms.includes(roomId)) {
      // Deseleccionar habitación
      const newSelected = selectedRooms.filter(id => id !== roomId);
      setSelectedRooms(newSelected);
      setFormData(prev => ({ ...prev, habitaciones_seleccionadas: newSelected }));
    } else if (selectedRooms.length < maxRooms) {
      // Seleccionar habitación
      const newSelected = [...selectedRooms, roomId];
      setSelectedRooms(newSelected);
      setFormData(prev => ({ ...prev, habitaciones_seleccionadas: newSelected }));
    }
  };

  // ✅ FUNCIÓN PARA RENDERIZAR EL ESTADO DE VALIDACIÓN DEL DOCUMENTO
  const renderDocumentValidation = () => {
    if (checking) {
      return (
        <div className="mt-2 flex items-center text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
          Verificando documento...
        </div>
      );
    }

    if (!documentValidation.available) return null;

    switch (documentValidation.reason) {
      case 'nuevo_cliente':
        return (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <Check className="h-4 w-4 mr-2" />
            {documentValidation.message}
          </div>
        );

      case 'cliente_anterior':
        return (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium">Cliente anterior identificado</p>
                <p className="text-blue-700">{documentValidation.message}</p>
                {documentValidation.clientInfo && (
                  <div className="mt-2 text-xs text-blue-600">
                    <p>Cliente anterior: {documentValidation.clientInfo.nombre_completo}</p>
                    {documentValidation.clientInfo.fecha_salida_real && (
                      <p>Última salida: {new Date(documentValidation.clientInfo.fecha_salida_real).toLocaleDateString('es-ES')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'cliente_activo':
        return (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              <div className="text-sm">
                <p className="text-red-800 font-medium">Cliente actualmente hospedado</p>
                <p className="text-red-700">{documentValidation.message}</p>
                {documentValidation.clientInfo && (
                  <div className="mt-2 text-xs text-red-600">
                    <p>Habitaciones asignadas: {documentValidation.clientInfo.habitaciones_asignadas}</p>
                    <p>Fecha de ingreso: {new Date(documentValidation.clientInfo.fecha_ingreso).toLocaleDateString('es-ES')}</p>
                    {documentValidation.clientInfo.fecha_salida && (
                      <p>Fecha de salida planeada: {new Date(documentValidation.clientInfo.fecha_salida).toLocaleDateString('es-ES')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isFormValid = !loading && 
    formData.nombres && 
    formData.apellidos && 
    formData.tipo_documento && 
    formData.numero_documento && 
    formData.tipo_pago && 
    formData.monto_pagado &&
    selectedRooms.length === parseInt(formData.numero_habitaciones_deseadas) &&
    documentValidation.available !== false || documentValidation.reason !== 'cliente_activo';

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Registrar Nuevo Cliente</h1>
          <p className="text-gray-600 text-sm">Complete la información del cliente y asigne habitaciones</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Información Personal */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Información Personal</h2>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Nombres */}
              <div>
                <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.nombres ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese los nombres"
                />
                {errors.nombres && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>
                )}
              </div>

              {/* Apellidos */}
              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.apellidos ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese los apellidos"
                />
                {errors.apellidos && (
                  <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Tipo de Documento */}
              <div>
                <label htmlFor="tipo_documento" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento *
                </label>
                <select
                  id="tipo_documento"
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={(e) => handleInputChange('tipo_documento', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.tipo_documento ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  {tipoDocumentoChoices.map(choice => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
                {errors.tipo_documento && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo_documento}</p>
                )}
              </div>

              {/* Número de Documento */}
              <div>
                <label htmlFor="numero_documento" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="numero_documento"
                    name="numero_documento"
                    value={formData.numero_documento}
                    onChange={(e) => handleInputChange('numero_documento', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.numero_documento ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={formData.tipo_documento === 'DNI' ? '12345678' : 'ABC123456'}
                    maxLength={formData.tipo_documento === 'DNI' ? 8 : 30}
                  />
                  {formData.numero_documento && formData.tipo_documento && (checking || documentValidation.available !== null) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {checking ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      ) : documentValidation.available ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* ✅ MOSTRAR VALIDACIÓN INTELIGENTE */}
                {renderDocumentValidation()}
                
                {errors.numero_documento && (
                  <p className="mt-1 text-sm text-red-600">{errors.numero_documento}</p>
                )}
              </div>

              {/* Edad */}
              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-2">
                  Edad (Opcional)
                </label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  value={formData.edad}
                  onChange={(e) => handleInputChange('edad', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.edad ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 25"
                  min="1"
                  max="120"
                />
                {errors.edad && (
                  <p className="mt-1 text-sm text-red-600">{errors.edad}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.telefono ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="987654321"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Entre 7 y 15 dígitos</p>
              </div>

              {/* Dirección */}
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección (Opcional)
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Av. Principal 123, Lima"
                  maxLength="200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fechas de Estadía */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Fechas de Estadía (Opcional)</h2>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Fecha de Ingreso */}
              <div>
                <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora de Ingreso
                </label>
                <input
                  type="datetime-local"
                  id="fecha_ingreso"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={(e) => handleInputChange('fecha_ingreso', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Fecha de Salida */}
              <div>
                <label htmlFor="fecha_salida" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora de Salida Planeada
                </label>
                <input
                  type="datetime-local"
                  id="fecha_salida"
                  name="fecha_salida"
                  value={formData.fecha_salida}
                  onChange={(e) => handleInputChange('fecha_salida', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.fecha_salida ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fecha_salida && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_salida}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">La hora real de salida se registrará al liberar las habitaciones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Asignación de Habitaciones */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              </div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Asignación de Habitaciones</h2>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Número de habitaciones deseadas */}
            <div>
              <label htmlFor="numero_habitaciones_deseadas" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Habitaciones Deseadas *
              </label>
              <input
                type="number"
                id="numero_habitaciones_deseadas"
                name="numero_habitaciones_deseadas"
                value={formData.numero_habitaciones_deseadas}
                onChange={(e) => handleInputChange('numero_habitaciones_deseadas', e.target.value)}
                className={`block w-full md:w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  errors.numero_habitaciones_deseadas ? 'border-red-300' : 'border-gray-300'
                }`}
                min="1"
                max="10"
              />
              {errors.numero_habitaciones_deseadas && (
                <p className="mt-1 text-sm text-red-600">{errors.numero_habitaciones_deseadas}</p>
              )}
            </div>

            {/* Selección de habitaciones */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Seleccionar Habitaciones ({selectedRooms.length}/{formData.numero_habitaciones_deseadas})
                </h3>
                <span className="text-xs text-gray-500">
                  {availableRooms.length} habitaciones disponibles
                </span>
              </div>
              
              {formData.numero_habitaciones_deseadas > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomSelection(room.id)}
                      className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                        selectedRooms.includes(room.id)
                          ? 'border-blue-500 bg-blue-50'
                          : selectedRooms.length >= formData.numero_habitaciones_deseadas
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                          selectedRooms.includes(room.id) ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          <Bed className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900">{room.numero}</p>
                          <p className="text-xs text-gray-600 capitalize">{room.tipo}</p>
                          <p className="text-xs font-medium text-gray-900">
                            S/ {parseFloat(room.precio_noche).toFixed(2)}
                          </p>
                        </div>
                        {selectedRooms.includes(room.id) && (
                          <div className="absolute top-1 right-1">
                            <Check className="h-4 w-4 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Ingrese el número de habitaciones deseadas para ver las opciones disponibles
                </p>
              )}
              
              {errors.habitaciones_seleccionadas && (
                <p className="mt-2 text-sm text-red-600">{errors.habitaciones_seleccionadas}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información de Pago */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
              </div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Información de Pago</h2>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Tipo de Pago */}
              <div>
                <label htmlFor="tipo_pago" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago *
                </label>
                <select
                  id="tipo_pago"
                  name="tipo_pago"
                  value={formData.tipo_pago}
                  onChange={(e) => handleInputChange('tipo_pago', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.tipo_pago ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tipo de pago</option>
                  {tipoPagoChoices.map(choice => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
                {errors.tipo_pago && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo_pago}</p>
                )}
              </div>

              {/* Monto Pagado */}
              <div>
                <label htmlFor="monto_pagado" className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Pagado (S/) *
                </label>
                <input
                  type="number"
                  id="monto_pagado"
                  name="monto_pagado"
                  value={formData.monto_pagado}
                  onChange={(e) => handleInputChange('monto_pagado', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.monto_pagado ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 180.00"
                  min="0.01"
                  step="0.01"
                />
                {errors.monto_pagado && (
                  <p className="mt-1 text-sm text-red-600">{errors.monto_pagado}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-4 md:px-6 py-3 md:py-4">
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
                disabled={!isFormValid}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                {loading ? 'Registrando...' : 'Registrar Cliente'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;