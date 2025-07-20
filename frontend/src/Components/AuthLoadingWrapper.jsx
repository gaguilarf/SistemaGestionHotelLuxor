// src/Components/AuthLoadingWrapper.jsx
import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

const AuthLoadingWrapper = ({ children }) => {
  const { loading, isInitialized, user } = useAuthContext();

  // Solo mostrar pantalla de carga durante la inicialización inicial
  // No mostrar durante logout o cuando no hay token
  const shouldShowLoading = loading && !isInitialized && localStorage.getItem('access_token');

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">Luxor</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthLoadingWrapper;