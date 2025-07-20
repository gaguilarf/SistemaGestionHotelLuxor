// src/components/common/ModuleTabs.jsx - Actualizado
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  Users,
  Shield,
  BedDouble,
  BarChart3,
  UserCheck,
  Menu,
  UserPlus, // Nuevo ícono para clientes
} from 'lucide-react';

import { useAuthContext } from '../../contexts/AuthContext';
import { canAccessRoute } from '../../utils/permissions';

const tabs = [

  {
    href: '/clients', // NUEVA RUTA
    label: 'Clientes',
    icon: UserPlus,
    groups: ['Administrador', 'Analista'],
    color: 'cyan'
  },
  {
    href: '/groups',
    label: 'Roles',
    icon: Shield,
    groups: ['Administrador'],
    color: 'indigo'
  },
  {
    href: '/rooms',
    label: 'Habitaciones',
    icon: BedDouble,
    groups: ['Administrador', 'Analista'],
    color: 'amber'
  },
  {
    href: '/reports',
    label: 'Reportes',
    icon: BarChart3,
    groups: ['Administrador', 'Analista'],
    color: 'purple'
  },
  {
    href: '/users',
    label: 'Usuarios',
    icon: UserCheck,
    groups: ['Administrador'],
    color: 'rose'
  },
];

const getColorClasses = (color, isActive) => {
  const colorMap = {
    emerald: {
      active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-200',
      inactive: 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
    },
    cyan: { // NUEVO COLOR PARA CLIENTES
      active: 'bg-cyan-600 text-white shadow-lg shadow-cyan-200',
      inactive: 'text-gray-600 hover:text-cyan-600 hover:bg-cyan-50'
    },
    blue: {
      active: 'bg-blue-600 text-white shadow-lg shadow-blue-200',
      inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
    },
    indigo: {
      active: 'bg-indigo-600 text-white shadow-lg shadow-indigo-200',
      inactive: 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
    },
    amber: {
      active: 'bg-amber-600 text-white shadow-lg shadow-amber-200',
      inactive: 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
    },
    purple: {
      active: 'bg-purple-600 text-white shadow-lg shadow-purple-200',
      inactive: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
    },
    rose: {
      active: 'bg-rose-600 text-white shadow-lg shadow-rose-200',
      inactive: 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
    }
  };

  return isActive ? colorMap[color].active : colorMap[color].inactive;
};

export default function ModuleTabs({ onOpenMobileMenu }) {
  const { user } = useAuthContext();
  const visibleTabs = tabs.filter(tab => canAccessRoute(tab.href, user));

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-4">
      {/* Mobile menu button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={onOpenMobileMenu}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
          <span className="text-gray-700 font-medium">Menú</span>
        </button>
      </div>

      {/* Desktop navigation */}
      <div className="hidden lg:flex justify-center space-x-1">
        {visibleTabs.map(({ href, label, icon: Icon, color }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${getColorClasses(color, isActive)}`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}