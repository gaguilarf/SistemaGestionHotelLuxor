// src/pages/rooms/EditRoom.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bed, DollarSign, Home, FileText, Check, AlertCircle } from 'lucide-react';
import { useRoom, useRooms, useCheckRoomNumber } from '../../hooks/useRooms';
import Button from '../../Components/common/Button';

const EditRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { room, loading: roomLoading, error } = useRoom(id);
  const { updateRoom } = useRooms();
  const { checkNumber, checking } = useCheckRoomNumber();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    tipo: '',
    precio_noche: '',
    estado: 'disponible',
    descripcion: ''
  });
  const [errors, setErrors] = useState({});
  const [numberAvailable, setNumberAvailable] = useState(null);
  const [originalNumber, setOriginalNumber] = useState('');

  const tipoChoices = [
    { value: 'simple', label: 'Simple' },
    { value: 'doble', label: 'Doble' },
    { value: 'triple', label: 'Triple' },
    { value: 'familiar', label: 'Familiar (4 camas)' }
  ];

  const estadoChoices = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupado', label: 'Ocupado' },          // Nuevo estado
    { value: 'sucio', label: 'Sucio' },
    { value: 'mantenimiento', label: 'En mantenimiento' }
  ];

  useEffect(() => {
    if (room) {
      setFormData({
        numero: room.numero?.toString() || '',
        tipo: room.tipo || '',
        precio_noche: room.precio_noche?.toString() || '',
        estado: room.estado || 'disponible',
        descripcion: room.descripcion || ''
      });
      setOriginalNumber(room.numero?.toString() || '');
    }
  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validaciones
    if (!formData.numero || formData.numero.trim() === '') {
      newErrors.numero = 'El número de habitación es requerido';
    } else if (parseInt(formData.numero) <= 0) {
      newErrors.numero = 'El número debe ser mayor a 0';
    } else if (parseInt(formData.numero) > 9999) {
      newErrors.numero = 'El número no puede tener más de 4 dígitos';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de habitación es requerido';
    }

    if (!formData.precio_noche || parseFloat(formData.precio_noche) <= 0) {
      newErrors.precio_noche = 'El precio por noche es requerido y debe ser mayor a 0';
    }

    // Si el número cambió y no está disponible
    if (formData.numero !== originalNumber && numberAvailable === false) {
      newErrors.numero = 'Este número de habitación ya está en uso';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await updateRoom(id, {
        ...formData,
        numero: parseInt(formData.numero),
        precio_noche: parseFloat(formData.precio_noche)
      });
      alert('Habitación actualizada exitosamente');
      navigate('/rooms');
    } catch (error) {
      alert('Error al actualizar habitación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/rooms');
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    // Check number availability when numero changes (only if it's different from original)
    if (field === 'numero' && value && value.length > 0 && value !== originalNumber) {
      checkRoomNumber(value);
    } else if (field === 'numero' && value === originalNumber) {
      setNumberAvailable(null);
    } else if (field === 'numero') {
      setNumberAvailable(null);
    }
  };

  const checkRoomNumber = async (numero) => {
    try {
      const result = await checkNumber(numero);
      setNumberAvailable(result.disponible);
    } catch (error) {
      console.error('Error checking room number:', error);
      setNumberAvailable(null);
    }
  };

  if (roomLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium text-sm md:text-base">Cargando habitación...</p>
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
        <Button variant="outline" onClick={handleCancel} className="mt-4 w-full md:w-auto">
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
            <p className="text-yellow-600 text-xs md:text-sm">La habitación solicitada no existe.</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleCancel} className="mt-4 w-full md:w-auto">
          Volver a habitaciones
        </Button>
      </div>
    );
  }

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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Editar Habitación</h1>
          <p className="text-gray-600 text-sm">Modifica la información de la habitación {room.numero}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bed className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Información de la Habitación</h2>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Room Info */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Información de la Habitación
              </h3>
              <div className="text-sm text-gray-700">
                <span className="font-medium">ID:</span> #{room.id}
              </div>
            </div>

            {/* Room Number */}
            <div>
              <label htmlFor="edit-room-number" className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="inline h-4 w-4 mr-1" />
                Número de Habitación *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="edit-room-number"
                  name="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.numero ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 101, 201, 301..."
                  min="1"
                  max="9999"
                />
                {formData.numero && formData.numero !== originalNumber && (checking || numberAvailable !== null) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {checking ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    ) : numberAvailable ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {formData.numero && formData.numero !== originalNumber && numberAvailable === false && (
                <p className="mt-1 text-sm text-red-600">Este número de habitación ya está en uso</p>
              )}
              {formData.numero && formData.numero !== originalNumber && numberAvailable === true && (
                <p className="mt-1 text-sm text-green-600">Número disponible</p>
              )}
              {errors.numero && (
                <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Máximo 4 dígitos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Room Type */}
              <div>
                <label htmlFor="edit-room-type" className="block text-sm font-medium text-gray-700 mb-2">
                  <Bed className="inline h-4 w-4 mr-1" />
                  Tipo de Habitación *
                </label>
                <select
                  id="edit-room-type"
                  name="tipo"
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.tipo ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  {tipoChoices.map(choice => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
                )}
              </div>

              {/* Room Price */}
              <div>
                <label htmlFor="edit-room-price" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Precio por Noche (S/) *
                </label>
                <input
                  type="number"
                  id="edit-room-price"
                  name="precio_noche"
                  value={formData.precio_noche}
                  onChange={(e) => handleInputChange('precio_noche', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.precio_noche ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 90.00, 120.00"
                  min="0.01"
                  step="0.01"
                />
                {errors.precio_noche && (
                  <p className="mt-1 text-sm text-red-600">{errors.precio_noche}</p>
                )}
              </div>
            </div>

            {/* Room Status */}
            <div>
              <label htmlFor="edit-room-status" className="block text-sm font-medium text-gray-700 mb-2">
                Estado de la Habitación
              </label>
              <select
                id="edit-room-status"
                name="estado"
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {estadoChoices.map(choice => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-room-description" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Descripción (Opcional)
              </label>
              <textarea
                id="edit-room-description"
                name="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Observaciones o detalles adicionales de la habitación..."
                maxLength="500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.descripcion.length}/500 caracteres
              </p>
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
                disabled={loading || !formData.numero || !formData.tipo || !formData.precio_noche || (formData.numero !== originalNumber && numberAvailable === false)}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                {loading ? 'Actualizando...' : 'Actualizar Habitación'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditRoom;