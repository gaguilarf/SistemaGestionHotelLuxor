// src/components/layout/MainLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { UserCircle, X, LogOut, User, Settings } from 'lucide-react';

import ModuleTabs from '../common/ModuleTabs';
import { useAuthContext } from '../../contexts/AuthContext';
import { formatFullName, getUserInitials } from '../../utils/userConstants';
import { canAccessRoute } from '../../utils/permissions';

export default function MainLayout() {
  const { user, logout } = useAuthContext();
  const [showMenu, setShowMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  const visibleTabs = [
    { href: '/clients', label: 'Clientes', icon: 'Users', groups: ['Administrador', 'Analista'] },
    { href: '/groups', label: 'Roles', icon: 'Shield', groups: ['Administrador'] },
    { href: '/rooms', label: 'Habitaciones', icon: 'BedDouble', groups: ['Administrador', 'Analista'] },
    { href: '/reports', label: 'Reportes', icon: 'BarChart3', groups: ['Administrador', 'Analista'] },
    { href: '/users', label: 'Usuarios', icon: 'UserCheck', groups: ['Administrador'] },
  ].filter(tab => canAccessRoute(tab.href, user));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sistema de Control Interno - Luxor
              </h1>
              <p className="text-sm text-gray-500 font-medium">Hotel Management System</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900">{formatFullName(user)}</p>
                      <p className="text-xs text-gray-500">{user.groups?.[0] || 'Usuario'}</p>
                    </div>
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      title={formatFullName(user)}
                      className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-white hover:ring-blue-300 transition-all duration-200 hover:scale-105"
                    >
                      {getUserInitials(user)}
                    </button>
                  </div>

                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-sm z-50 overflow-hidden">
                      {/* Header del dropdown */}
                      <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                            {getUserInitials(user)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {formatFullName(user)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              {user.groups?.[0] || 'Usuario'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Opciones del dropdown */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            // Aquí podrías agregar navegación al perfil
                            console.log('Ver perfil');
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={16} className="text-gray-400" />
                          <span>Ver Perfil</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            // Aquí podrías agregar navegación a configuración
                            console.log('Configuración');
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={16} className="text-gray-400" />
                          <span>Configuración</span>
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} className="text-red-500" />
                          <span className="font-medium">Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <UserCircle size={32} className="text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 sticky top-[88px] z-30">
        <ModuleTabs onOpenMobileMenu={() => setShowMenu(true)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 min-h-[600px]">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Navegación</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {visibleTabs.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}