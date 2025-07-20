import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faTimes, faHotel, faKey, faUserTie, faBell, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { faBell as faBellRegular } from '@fortawesome/free-regular-svg-icons';
import { useAuthContext } from '../contexts/AuthContext';

// Importar la imagen de la habitación
import habitacionImage from '../assets/images/habitacion.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  // Usar el contexto de autenticación
  const { login } = useAuthContext();

  const SESSION_TIMEOUT_SECONDS = 300; // 5 minutos

  const setupSessionTimeout = () => {
    if (!rememberMe) {
      const timeoutMs = SESSION_TIMEOUT_SECONDS * 1000;
      const expirationTime = Date.now() + timeoutMs;
      
      localStorage.setItem('session_expiration', expirationTime.toString());
      
      const timeoutId = setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('session_expiration');
        
        alert('Tu sesión ha expirado por límite de tiempo. Por favor, inicia sesión nuevamente.');
        
        navigate('/');
      }, timeoutMs);
      
      localStorage.setItem('session_timeout_id', timeoutId.toString());
    } else {
      localStorage.removeItem('session_expiration');
      localStorage.removeItem('session_timeout_id');
    }
  };

  const checkSessionExpiration = () => {
    const expirationTime = localStorage.getItem('session_expiration');
    if (expirationTime && Date.now() > parseInt(expirationTime)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_expiration');
      localStorage.removeItem('session_timeout_id');
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        setupSessionTimeout();
        
        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        setError(result.error || 'Usuario o contraseña inválidos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpClick = (e) => {
    e.preventDefault();
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  useEffect(() => {
    if (checkSessionExpiration()) {
      setError('Tu sesión anterior ha expirado. Por favor, inicia sesión nuevamente.');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo elegante con colores azules de lujo */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800"></div>
      
      {/* Efectos de fondo elegantes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-300 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-tr from-blue-400 to-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Patrón de lujo superpuesto */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(59, 130, 246, 0.1) 2px,
          rgba(59, 130, 246, 0.1) 4px
        )`
      }}></div>

      {showNotification && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-4 shadow-xl animate-slideDown backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              <span className="font-medium">Contactando con recepción del hotel...</span>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-white hover:text-gray-200 ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl mx-4">
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-200/30">
            
            {/* Header del hotel */}
            <div className="mb-8 text-center">
              <div className="mb-6">
                <FontAwesomeIcon icon={faHotel} className="text-6xl text-blue-600 mb-4" />
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent mb-2">
                  LUXOR
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full mb-2"></div>
                <div className="text-sm font-semibold text-blue-700 tracking-wider">HOTEL </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-2">Panel de Administración</p>
              <p className="text-gray-600 text-sm">Sistema de Gestión Hotelera</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="group">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario del Sistema
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                      <FontAwesomeIcon icon={faBell} className="text-gray-400 text-lg" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 transition-all duration-300 hover:border-gray-400"
                      placeholder="Ingrese su usuario"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña de Acceso
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                      <FontAwesomeIcon icon={faKey} className="text-gray-400 text-lg" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 transition-all duration-300 hover:border-gray-400"
                      placeholder="Ingrese su contraseña"
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-lg" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    autoComplete="off"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-gray-700 font-medium">
                    Mantener sesión activa
                  </label>
                </div>
                <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                  {rememberMe ? 'Permanente' : `${SESSION_TIMEOUT_SECONDS}s`}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                >
                  <span className="relative z-10">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verificando acceso...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FontAwesomeIcon icon={faHotel} className="mr-2" />
                        Acceder al Sistema
                      </div>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-900 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-3">¿Problemas para acceder al sistema?</p>
              <button 
                onClick={handleHelpClick}
                className="inline-flex items-center font-medium text-blue-700 hover:text-blue-800 transition duration-300 underline decoration-2 underline-offset-2 hover:decoration-blue-600"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Contactar Soporte Técnico
              </button>
            </div>
          </div>
        </div>

        {/* Lado derecho con información del hotel */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm rounded-3xl transform rotate-2"></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-blue-200/30">
              {/* Aquí usar tu imagen real de la habitación */}
              <div className="text-center mb-8">
                <img
                  src={habitacionImage}
                  alt="Hotel Luxor - Habitación de Lujo"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg mb-6"
                />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Hotel Luxor
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full mb-6"></div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Experiencia de lujo y confort excepcional
                </p>
              </div>

              {/* Características del sistema */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={faBellRegular} className="text-amber-600" />
                  </div>
                  <span className="font-medium">Gestión de Reservas</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={faUserTie} className="text-amber-600" />
                  </div>
                  <span className="font-medium">Administración de Huéspedes</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={faBuilding} className="text-amber-600" />
                  </div>
                  <span className="font-medium">Control de Habitaciones</span>
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 w-full h-full bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Línea decorativa inferior */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700"></div>
    </div>
  );
};

export default Login;