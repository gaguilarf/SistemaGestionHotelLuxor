// src/Components/RedirectIfAuth.jsx - VERSIÓN CORREGIDA
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const RedirectIfAuth = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuthContext();

  // Mostrar loading mientras se verifica
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">Luxor</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando estado...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado Y hay usuario, redirigir al dashboard
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, mostrar el contenido (página de login)
  return children;
};

export default RedirectIfAuth;