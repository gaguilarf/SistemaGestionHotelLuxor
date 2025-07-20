import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import userService from '../services/userService';
import { formatFullName } from '../utils/userConstants';

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const userId = tokenPayload.user_id;
          const data = await userService.getUserById(userId);
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('Error obteniendo usuario actual:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return { currentUser, loading };
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  const getDisplayName = () => {
    if (!currentUser) return 'Usuario';
    const fullName = formatFullName(currentUser);
    return fullName && fullName !== currentUser.username
      ? fullName
      : currentUser.username || 'Usuario';
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 p-10 rounded-2xl shadow-xl mt-8">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-4 text-center">
        {loading ? '¡Bienvenido!' : `¡Bienvenido, ${getDisplayName()}!`}
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-xl">
        Has iniciado sesión con éxito en el sistema de gestión. Explora los módulos disponibles desde el menú superior.
      </p>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
      >
        <LogOut size={18} />
        Cerrar Sesión
      </button>
    </div>
  );
};

export default UserDashboard;
