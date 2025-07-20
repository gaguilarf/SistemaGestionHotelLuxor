// src/components/AccessDenied.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 p-8 text-center">
          {/* Icono */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>

          {/* Mensaje */}
          <p className="text-gray-600 mb-8">
            No tienes los permisos necesarios para acceder a esta sección.
          </p>

          {/* Información adicional */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-800">
              Si crees que esto es un error, por favor contacta al administrador del sistema.
            </p>
          </div>

          {/* Botón de regreso */}
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </button>
        </div>

        {/* Información del usuario */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Si necesitas acceso a esta sección, solicítalo a tu supervisor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;