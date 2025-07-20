import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSessionManager = () => {
  const navigate = useNavigate();

  // Función para verificar si la sesión ha expirado
  const checkSessionExpiration = useCallback(() => {
    const expirationTime = localStorage.getItem('session_expiration');
    const accessToken = localStorage.getItem('access_token');
    
    // Si no hay token, no hay sesión activa
    if (!accessToken) {
      return false;
    }
    
    // Si hay expirationTime configurada y ya expiró
    if (expirationTime && Date.now() > parseInt(expirationTime)) {
      return true;
    }
    
    return false;
  }, []);

  // Función para limpiar la sesión
  const clearSession = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_expiration');
    localStorage.removeItem('session_timeout_id');
  }, []);

  // Función para cerrar sesión por expiración
  const handleSessionExpiration = useCallback(() => {
    clearSession();
    alert('Tu sesión ha expirado por límite de tiempo. Por favor, inicia sesión nuevamente.');
    navigate('/');
  }, [clearSession, navigate]);

  // Función para extender la sesión (reiniciar el temporizador)
  const extendSession = useCallback(() => {
    const expirationTime = localStorage.getItem('session_expiration');
    
    // Solo extender si hay una sesión temporal activa
    if (expirationTime) {
      const SESSION_TIMEOUT_SECONDS = 300 // Debe coincidir con el valor del Login
      const timeoutMs = SESSION_TIMEOUT_SECONDS * 1000;
      const newExpirationTime = Date.now() + timeoutMs;
      
      localStorage.setItem('session_expiration', newExpirationTime.toString());
      
      // Cancelar el timeout anterior si existe
      const oldTimeoutId = localStorage.getItem('session_timeout_id');
      if (oldTimeoutId) {
        clearTimeout(parseInt(oldTimeoutId));
      }
      
      // Configurar nuevo timeout
      const timeoutId = setTimeout(() => {
        handleSessionExpiration();
      }, timeoutMs);
      
      localStorage.setItem('session_timeout_id', timeoutId.toString());
    }
  }, [handleSessionExpiration]);

  // Verificar sesión al montar el componente
  useEffect(() => {
    if (checkSessionExpiration()) {
      handleSessionExpiration();
    }
  }, [checkSessionExpiration, handleSessionExpiration]);

  // Configurar listeners para actividad del usuario (opcional)
  useEffect(() => {
    const handleUserActivity = () => {
      extendSession();
    };

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Solo agregar listeners si hay una sesión temporal activa
    const expirationTime = localStorage.getItem('session_expiration');
    if (expirationTime) {
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
      });
    }

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [extendSession]);

  return {
    checkSessionExpiration,
    clearSession,
    extendSession,
    handleSessionExpiration
  };
};