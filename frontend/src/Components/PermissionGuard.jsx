// src/Components/PermissionGuard.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { canAccessRoute } from '../utils/permissions';
import AccessDenied from './AccessDenied';

const PermissionGuard = ({ children }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  // Mientras carga, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-700 border-t-transparent shadow-lg"></div>
          <p className="text-green-800 font-semibold text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario tiene acceso a la ruta actual
  const hasAccess = canAccessRoute(location.pathname, user);

  // Si no tiene acceso, mostrar mensaje
  if (!hasAccess) {
    return <AccessDenied />;
  }

  // Si tiene acceso, renderizar el contenido
 return children;
};

export default PermissionGuard; 