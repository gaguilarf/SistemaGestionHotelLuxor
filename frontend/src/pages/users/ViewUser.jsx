// src/pages/users/ViewUser.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  IdCard,
  Calendar,
  Shield,
  UserCheck,
  Settings,
  Clock,
  Edit,
  Users,
} from "lucide-react";
import { useUser } from "../../hooks/useUsers";
import Button from "../../Components/common/Button";

// Función auxiliar para obtener el grupo del usuario
const getUserGroup = (user) => {
  if (user.group_frontend) {
    return user.group_frontend;
  }
  
  if (user.group_name) {
    return user.group_name;
  }
  
  if (user.groups && Array.isArray(user.groups) && user.groups.length > 0) {
    if (user.groups[0].name) {
      return user.groups[0].name;
    }
    return user.groups[0];
  }
  
  return null;
};

// Función auxiliar para formatear el nombre del grupo
const formatGroupName = (groupName) => {
  if (!groupName) return null;
  
  const groupMap = {
    'analista': 'Analista',
    'administrador': 'Administrador',
    'visualizador': 'Visualizador'
  };
  
  const lowerGroupName = groupName.toLowerCase();
  return groupMap[lowerGroupName] || groupName.charAt(0).toUpperCase() + groupName.slice(1);
};

// Función auxiliar para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'No especificado';
  try {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

// Función auxiliar para obtener iniciales
const getUserInitials = (user) => {
  if (!user) return '';
  const firstInitial = user.first_name ? user.first_name.charAt(0).toUpperCase() : '';
  const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
  const usernameInitial = user.username ? user.username.charAt(0).toUpperCase() : '';
  
  return firstInitial && lastInitial ? `${firstInitial}${lastInitial}` : usernameInitial || 'U';
};

// Función auxiliar para formatear nombre completo
const formatFullName = (user) => {
  if (!user) return '';
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Usuario';
};

const ViewUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading, error } = useUser(id);

  const handleBack = () => {
    navigate("/users");
  };

  const handleEdit = () => {
    navigate(`/users/edit/${user.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium text-sm md:text-base">
            Cargando información del usuario...
          </p>
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
            <h3 className="text-red-800 font-semibold text-sm md:text-base">
              Error al cargar usuario
            </h3>
            <p className="text-red-600 text-xs md:text-sm">{error}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4 w-full md:w-auto">
          <ArrowLeft size={16} className="mr-2" />
          Volver a usuarios
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6 m-4 md:m-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">?</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-yellow-800 font-semibold text-sm md:text-base">
              Usuario no encontrado
            </h3>
            <p className="text-yellow-600 text-xs md:text-sm">
              El usuario solicitado no existe o no tienes permisos para verlo.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack} className="mt-4 w-full md:w-auto">
          <ArrowLeft size={16} className="mr-2" />
          Volver a usuarios
        </Button>
      </div>
    );
  }

  // Obtener el grupo del usuario
  const userGroup = getUserGroup(user);
  const formattedGroupName = formatGroupName(userGroup);

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </Button>
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
            <p className="text-gray-600 text-sm">Información detallada del usuario</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleEdit}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
        >
          <Edit size={16} />
          <span>Editar Usuario</span>
        </Button>
      </div>

      {/* User Profile Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gray-50 px-4 md:px-6 py-4 md:py-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-lg md:text-xl">
                {getUserInitials(user)}
              </span>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{formatFullName(user)}</h2>
              <p className="text-gray-600 text-sm md:text-base">@{user.username}</p>
              <p className="text-gray-600 text-sm md:text-base break-all">{user.email}</p>
              
              {/* Status Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </span>

                {user.is_staff && (
                  <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-medium rounded-full">
                    Staff
                  </span>
                )}

                {formattedGroupName && (
                  <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-medium rounded-full">
                    {formattedGroupName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-500" />
                Información Personal
              </h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <IdCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">DNI</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900 break-words">
                      {user.dni || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Email</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900 break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Teléfono</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      {user.phone || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-500" />
                Información de Cuenta
              </h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <UserCheck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Estado</p>
                    <p className={`text-sm md:text-base font-semibold ${
                      user.is_active ? "text-green-600" : "text-red-600"
                    }`}>
                      {user.is_active ? "Cuenta Activa" : "Cuenta Inactiva"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Permisos</p>
                    <p className={`text-sm md:text-base font-semibold ${
                      user.is_staff ? "text-amber-600" : "text-gray-600"
                    }`}>
                      {user.is_staff ? "Personal de Staff" : "Usuario Regular"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Grupo</p>
                    {formattedGroupName ? (
                      <p className="text-sm md:text-base font-semibold text-purple-600">
                        {formattedGroupName}
                      </p>
                    ) : (
                      <p className="text-sm md:text-base font-semibold text-gray-400 italic">
                        Sin grupo asignado
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Information */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-500" />
                Actividad
              </h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Fecha de Registro</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Último Acceso</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      {user.last_login ? formatDate(user.last_login) : "Nunca"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-gray-500 font-medium">ID de Usuario</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">#{user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            Resumen del Usuario
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Nombre</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 break-words">
                    {formatFullName(user)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Grupo</p>
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {formattedGroupName || 'Sin grupo'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${
                  user.is_active ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <UserCheck className={`w-4 h-4 md:w-5 md:h-5 ${
                    user.is_active ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Estado</p>
                  <p className={`text-sm md:text-base font-semibold ${
                    user.is_active ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Groups Information */}
      {user.groups && Array.isArray(user.groups) && user.groups.length > 1 && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-500" />
            Grupos Adicionales
          </h3>

          <div className="flex flex-wrap gap-2">
            {user.groups.slice(1).map((group, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-medium rounded-full"
              >
                {group.name || group}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUser;