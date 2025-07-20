// src/pages/clients/EditClient.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, FileText, CreditCard, Calendar, Check, AlertCircle, Home, Plus, Bed } from 'lucide-react';
import { useClient, useClients, useCheckDocument, useAvailableRooms, useAddRoomsToClient } from '../../hooks/useClients';
import Button from '../../Components/common/Button';

// Constantes
const TIPO_DOCUMENTO_CHOICES = [
  { value: 'DNI', label: 'DNI' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'carnet_extranjeria', label: 'Carnet de extranjería' }
];

const TIPO_PAGO_CHOICES = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'billetera_digital', label: 'Billetera digital' },
  { value: 'visa', label: 'Visa' }
];

const INITIAL_FORM_DATA = {
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
  monto_pagado: ''
};

// ✅ NUEVA FUNCIÓN: Obtener colores para estados de habitaciones
const getRoomStatusColor = (estado) => {
  switch (estado) {
    case 'disponible':
      return 'text-green-600 bg-green-100';
    case 'ocupado':           // Amarillo para ocupado
      return 'text-yellow-600 bg-yellow-100';
    case 'sucio':             // Azul para sucio/necesita limpieza
      return 'text-blue-600 bg-blue-100';
    case 'mantenimiento':     // Rojo para mantenimiento
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// ✅ NUEVA FUNCIÓN: Obtener color del icono de habitación según estado
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

// ✅ NUEVA FUNCIÓN: Obtener texto display del estado
const getRoomStatusDisplay = (estado) => {
  switch (estado) {
    case 'disponible': return 'Disponible';
    case 'ocupado': return 'Ocupado';
    case 'sucio': return 'Sucio';
    case 'mantenimiento': return 'Mantenimiento';
    default: return estado;
  }
};

// Utilidad para formatear fecha
const formatDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

// Componentes reutilizables
const SectionHeader = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
        </div>
        <h2 className="text-base md:text-lg font-semibold text-gray-900">{title}</h2>
        {children}
      </div>
    </div>
  </div>
);

const FormField = ({ label, error, required = false, children, helpText }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
  </div>
);

const LoadingSpinner = ({ message }) => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      <p className="text-gray-600 font-medium text-sm md:text-base">{message}</p>
    </div>
  </div>
);

const ErrorMessage = ({ title, message, onBack }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 m-4 md:m-0">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs md:text-sm">!</span>
        </div>
      </div>
      <div className="ml-3">
        <h3 className="text-red-800 font-semibold text-sm md:text-base">{title}</h3>
        <p className="text-red-600 text-xs md:text-sm">{message}</p>
      </div>
    </div>
    <Button variant="outline" onClick={onBack} className="mt-4 w-full md:w-auto">
      Volver a clientes
    </Button>
  </div>
);

// ✅ COMPONENTE ACTUALIZADO: RoomCard con colores correctos
const RoomCard = ({ assignment }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRoomIconColor(assignment.room.estado)}`}>
          <Home className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Habitación {assignment.room.numero}</p>
          <p className="text-xs text-gray-600 capitalize">{assignment.room.tipo}</p>
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoomStatusColor(assignment.room.estado)}`}>
        {getRoomStatusDisplay(assignment.room.estado)}
      </span>
    </div>
    <div className="space-y-1 text-xs text-gray-600">
      <p>Precio: S/ {parseFloat(assignment.room.precio_noche).toFixed(2)}/noche</p>
      <p>Asignada: {new Date(assignment.fecha_asignacion).toLocaleDateString('es-ES')}</p>
    </div>
  </div>
);

const AvailableRoomCard = ({ room, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(room.id)}
    className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
      isSelected
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
    }`}
  >
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
        isSelected ? 'bg-green-500' : 'bg-gray-400'
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
      {isSelected && (
        <div className="absolute top-1 right-1">
          <Check className="h-4 w-4 text-green-500" />
        </div>
      )}
    </div>
  </div>
);

// Hook personalizado para validaciones
const useFormValidation = (formData, originalDocument) => {
  const validateForm = () => {
    const errors = {};

    // Campos obligatorios
    if (!formData.nombres?.trim()) errors.nombres = 'Los nombres son requeridos';
    if (!formData.apellidos?.trim()) errors.apellidos = 'Los apellidos son requeridos';
    if (!formData.tipo_documento) errors.tipo_documento = 'El tipo de documento es requerido';
    if (!formData.numero_documento?.trim()) errors.numero_documento = 'El número de documento es requerido';
    if (!formData.numero_habitaciones_deseadas || formData.numero_habitaciones_deseadas <= 0) {
      errors.numero_habitaciones_deseadas = 'Debe desear al menos 1 habitación';
    }
    if (!formData.tipo_pago) errors.tipo_pago = 'El tipo de pago es requerido';
    if (!formData.monto_pagado || parseFloat(formData.monto_pagado) <= 0) {
      errors.monto_pagado = 'El monto pagado es requerido y debe ser mayor a 0';
    }

    // Validaciones de formato
    if (formData.numero_documento && formData.tipo_documento) {
      if (formData.tipo_documento === 'DNI' && !/^\d{8}$/.test(formData.numero_documento)) {
        errors.numero_documento = 'El DNI debe tener exactamente 8 dígitos';
      } else if (['pasaporte', 'carnet_extranjeria'].includes(formData.tipo_documento) && formData.numero_documento.length > 30) {
        errors.numero_documento = 'El documento debe tener máximo 30 caracteres';
      }
    }

    // Validaciones opcionales
    if (formData.edad && (parseInt(formData.edad) <= 0 || parseInt(formData.edad) > 120)) {
      errors.edad = 'La edad debe estar entre 1 y 120 años';
    }
    if (formData.telefono && (formData.telefono.length < 7 || formData.telefono.length > 15 || !/^\d+$/.test(formData.telefono))) {
      errors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
    }

    // Validación de fechas
    if (formData.fecha_ingreso && formData.fecha_salida) {
      const fechaIngreso = new Date(formData.fecha_ingreso);
      const fechaSalida = new Date(formData.fecha_salida);
      if (fechaSalida <= fechaIngreso) {
        errors.fecha_salida = 'La fecha de salida debe ser posterior a la fecha de ingreso';
      }
    }

    return errors;
  };

  return { validateForm };
};

// Componente principal
const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { client, loading: clientLoading, error, refreshClient } = useClient(id);
  const { updateClient } = useClients();
  const { checkDocument, checking } = useCheckDocument();
  const { availableRooms, refetch: refetchAvailableRooms } = useAvailableRooms();
  const { addRooms, loading: addingRooms } = useAddRoomsToClient();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [documentoAvailable, setDocumentoAvailable] = useState(null);
  const [originalDocument, setOriginalDocument] = useState({ tipo: '', numero: '' });
  const [showAddRooms, setShowAddRooms] = useState(false);
  const [selectedNewRooms, setSelectedNewRooms] = useState([]);

  const { validateForm } = useFormValidation(formData, originalDocument);

  // Efectos
  useEffect(() => {
    if (client) {
      setFormData({
        nombres: client.nombres || '',
        apellidos: client.apellidos || '',
        tipo_documento: client.tipo_documento || '',
        numero_documento: client.numero_documento || '',
        edad: client.edad ? client.edad.toString() : '',
        telefono: client.telefono || '',
        direccion: client.direccion || '',
        fecha_ingreso: formatDateTimeLocal(client.fecha_ingreso),
        fecha_salida: formatDateTimeLocal(client.fecha_salida),
        numero_habitaciones_deseadas: client.numero_habitaciones_deseadas || 1,
        tipo_pago: client.tipo_pago || '',
        monto_pagado: client.monto_pagado ? client.monto_pagado.toString() : ''
      });
      
      setOriginalDocument({
        tipo: client.tipo_documento || '',
        numero: client.numero_documento || ''
      });
    }
  }, [client]);

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    const documentChanged = formData.tipo_documento !== originalDocument.tipo || 
                           formData.numero_documento !== originalDocument.numero;
    
    if (documentChanged && documentoAvailable === false) {
      validationErrors.numero_documento = 'Este documento ya está registrado';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const clientData = {
        ...formData,
        numero_habitaciones_deseadas: parseInt(formData.numero_habitaciones_deseadas),
        monto_pagado: parseFloat(formData.monto_pagado),
        edad: formData.edad ? parseInt(formData.edad) : null
      };

      await updateClient(id, clientData);
      alert('Cliente actualizado exitosamente');
      navigate('/clients');
    } catch (error) {
      alert('Error al actualizar cliente: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRooms = async () => {
    if (selectedNewRooms.length === 0) {
      alert('Debe seleccionar al menos una habitación');
      return;
    }

    try {
      const result = await addRooms(id, selectedNewRooms);
      alert(result.message);
      
      await Promise.all([refreshClient(), refetchAvailableRooms()]);
      
      setSelectedNewRooms([]);
      setShowAddRooms(false);
    } catch (error) {
      alert('Error al agregar habitaciones: ' + error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Verificar disponibilidad de documento
    if (field === 'numero_documento' || field === 'tipo_documento') {
      const tipoDoc = field === 'tipo_documento' ? value : formData.tipo_documento;
      const numDoc = field === 'numero_documento' ? value : formData.numero_documento;
      const documentChanged = tipoDoc !== originalDocument.tipo || numDoc !== originalDocument.numero;
      
      if (documentChanged && tipoDoc && numDoc && numDoc.length > 0) {
        checkDocumentAvailability(tipoDoc, numDoc);
      } else {
        setDocumentoAvailable(null);
      }
    }
  };

  const checkDocumentAvailability = async (tipoDocumento, numeroDocumento) => {
    try {
      const result = await checkDocument(tipoDocumento, numeroDocumento);
      setDocumentoAvailable(result.disponible);
    } catch (error) {
      console.error('Error checking document:', error);
      setDocumentoAvailable(null);
    }
  };

  const handleNewRoomSelection = (roomId) => {
    setSelectedNewRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const closeModal = () => {
    setShowAddRooms(false);
    setSelectedNewRooms([]);
  };

  // Renders condicionales
  if (clientLoading) return <LoadingSpinner message="Cargando cliente..." />;
  if (error) return <ErrorMessage title="Error al cargar cliente" message={error} onBack={() => navigate('/clients')} />;
  if (!client) return <ErrorMessage title="Cliente no encontrado" message="El cliente solicitado no existe." onBack={() => navigate('/clients')} />;

  const isFormValid = !loading && 
    formData.nombres && 
    formData.apellidos && 
    formData.tipo_documento && 
    formData.numero_documento && 
    formData.tipo_pago && 
    formData.monto_pagado &&
    !(formData.tipo_documento !== originalDocument.tipo || formData.numero_documento !== originalDocument.numero) || documentoAvailable !== false;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <Button variant="outline" onClick={() => navigate('/clients')} className="flex items-center justify-center space-x-2 w-full sm:w-auto">
          <ArrowLeft size={16} />
          <span>Volver</span>
        </Button>
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-600 text-sm">Modifica la información del cliente {client.nombre_completo}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {client.nombres.charAt(0)}{client.apellidos.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Cliente ID: #{client.id}</h3>
            <p className="text-xs text-blue-700">
              {client.habitaciones_asignadas?.length > 0 
                ? `${client.habitaciones_asignadas.length} habitaciones asignadas`
                : 'Sin habitaciones asignadas'
              }
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Información Personal */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader icon={User} title="Información Personal" />
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <FormField label="Nombres" error={errors.nombres} required>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.nombres ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese los nombres"
                />
              </FormField>

              <FormField label="Apellidos" error={errors.apellidos} required>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.apellidos ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese los apellidos"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <FormField label="Tipo de Documento" error={errors.tipo_documento} required>
                <select
                  value={formData.tipo_documento}
                  onChange={(e) => handleInputChange('tipo_documento', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.tipo_documento ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  {TIPO_DOCUMENTO_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Número de Documento" error={errors.numero_documento} required>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.numero_documento}
                    onChange={(e) => handleInputChange('numero_documento', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.numero_documento ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={formData.tipo_documento === 'DNI' ? '12345678' : 'ABC123456'}
                    maxLength={formData.tipo_documento === 'DNI' ? 8 : 30}
                  />
                  {formData.numero_documento && formData.tipo_documento && 
                   (formData.tipo_documento !== originalDocument.tipo || formData.numero_documento !== originalDocument.numero) &&
                   (checking || documentoAvailable !== null) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {checking ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      ) : documentoAvailable ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.numero_documento && 
                 (formData.tipo_documento !== originalDocument.tipo || formData.numero_documento !== originalDocument.numero) &&
                 documentoAvailable === false && (
                  <p className="mt-1 text-sm text-red-600">Este documento ya está registrado</p>
                )}
                {formData.numero_documento && 
                 (formData.tipo_documento !== originalDocument.tipo || formData.numero_documento !== originalDocument.numero) &&
                 documentoAvailable === true && (
                  <p className="mt-1 text-sm text-green-600">Documento disponible</p>
                )}
              </FormField>

              <FormField label="Edad (Opcional)" error={errors.edad}>
                <input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => handleInputChange('edad', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.edad ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 25"
                  min="1"
                  max="120"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <FormField label="Teléfono (Opcional)" error={errors.telefono} helpText="Entre 7 y 15 dígitos">
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.telefono ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="987654321"
                />
              </FormField>

              <FormField label="Dirección (Opcional)">
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Av. Principal 123, Lima"
                  maxLength="200"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Fechas de Estadía */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader icon={Calendar} title="Fechas de Estadía (Opcional)" />
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <FormField label="Fecha y Hora de Ingreso">
                <input
                  type="datetime-local"
                  value={formData.fecha_ingreso}
                  onChange={(e) => handleInputChange('fecha_ingreso', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </FormField>

              <FormField 
                label="Fecha y Hora de Salida Planeada" 
                error={errors.fecha_salida}
                helpText="La hora real de salida se registrará al liberar las habitaciones"
              >
                <input
                  type="datetime-local"
                  value={formData.fecha_salida}
                  onChange={(e) => handleInputChange('fecha_salida', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.fecha_salida ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Información de Reserva */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader icon={FileText} title="Información de Reserva" />
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <FormField 
                label="Número de Habitaciones Deseadas" 
                error={errors.numero_habitaciones_deseadas} 
                required
                helpText="Se actualiza automáticamente al agregar habitaciones"
              >
                <input
                  type="number"
                  value={formData.numero_habitaciones_deseadas}
                  onChange={(e) => handleInputChange('numero_habitaciones_deseadas', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.numero_habitaciones_deseadas ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="1"
                  max="10"
                />
              </FormField>

              <FormField label="Tipo de Pago" error={errors.tipo_pago} required>
                <select
                  value={formData.tipo_pago}
                  onChange={(e) => handleInputChange('tipo_pago', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.tipo_pago ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tipo de pago</option>
                  {TIPO_PAGO_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Monto Pagado (S/)" error={errors.monto_pagado} required>
              <input
                type="number"
                value={formData.monto_pagado}
                onChange={(e) => handleInputChange('monto_pagado', e.target.value)}
                className={`block w-full md:w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  errors.monto_pagado ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: 180.00"
                min="0.01"
                step="0.01"
              />
            </FormField>
          </div>
        </div>

        {/* Habitaciones Asignadas */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-yellow-50 px-4 md:px-6 py-3 md:py-4 border-b border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                </div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Habitaciones Asignadas</h2>
                <span className="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                  {client.habitaciones_asignadas?.length || 0} habitaciones
                </span>
              </div>
              {availableRooms.length > 0 && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddRooms(true)}
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Habitaciones</span>
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {client.habitaciones_asignadas && client.habitaciones_asignadas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.habitaciones_asignadas.map((assignment) => (
                  <RoomCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">Sin habitaciones asignadas</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Este cliente aún no tiene habitaciones asignadas.
                </p>
                {availableRooms.length > 0 && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddRooms(true)}
                    className="mt-4 flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Primera Habitación</span>
                  </Button>
                )}
              </div>
            )}
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Puedes agregar más habitaciones usando el botón "Agregar Habitaciones". 
                Para liberar habitaciones, usa la función "Liberar habitaciones" en la lista de clientes.
              </p>
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
                onClick={() => navigate('/clients')}
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
                {loading ? 'Actualizando...' : 'Actualizar Cliente'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal para agregar habitaciones - Bottom Sheet */}
      {showAddRooms && (
        <div className="fixed inset-0 z-50">
          {/* Overlay que cubre toda la pantalla */}
          <div 
            className="absolute inset-0 bg-gray bg-opacity-30"
            onClick={closeModal}
          ></div>
          
          {/* Modal deslizante desde abajo */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[70vh] overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                {/* Indicador visual del modal deslizante */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-4">
                  Agregar Habitaciones a {client.nombre_completo}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-xl mt-4"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Selecciona las habitaciones adicionales que deseas asignar a este cliente.
                  Actualmente tiene {client.habitaciones_asignadas?.length || 0} habitaciones asignadas.
                </p>
                <p className="text-sm font-medium text-gray-900 mt-2">
                  Habitaciones seleccionadas: {selectedNewRooms.length}
                </p>
              </div>

              {availableRooms.length > 0 ? (
                <div 
                  ref={(el) => {
                    // Auto-scroll cuando se abre el modal
                    if (el && showAddRooms) {
                      setTimeout(() => {
                        el.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }, 100);
                    }
                  }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                >
                  {availableRooms.map((room) => (
                    <AvailableRoomCard
                      key={room.id}
                      room={room}
                      isSelected={selectedNewRooms.includes(room.id)}
                      onSelect={handleNewRoomSelection}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bed className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No hay habitaciones disponibles</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Todas las habitaciones están ocupadas o en mantenimiento.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={addingRooms}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddRooms}
                  loading={addingRooms}
                  disabled={addingRooms || selectedNewRooms.length === 0}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  {addingRooms ? 'Agregando...' : `Agregar ${selectedNewRooms.length} Habitación${selectedNewRooms.length !== 1 ? 'es' : ''}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClient;