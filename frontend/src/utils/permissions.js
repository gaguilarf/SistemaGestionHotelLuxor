// src/utils/permissions.js

// Definir qué grupos tienen acceso a qué rutas
export const ROUTE_PERMISSIONS = {
  '/dashboard': {
    groups: ['Administrador', 'Analista', 'Visualizador'],
  },
  '/users': {
    groups: ['Administrador'],
  },
  '/groups': {
    groups: ['Administrador'],
  },

  '/clients': {
    groups: ['Administrador', 'Analista'],
  },
  '/roles': {
    groups: ['Administrador'],
  },
  '/rooms': {
    groups: ['Administrador', 'Analista'],
  },
  '/reports': {
    groups: ['Administrador', 'Analista'],
  },
};

// Verificar si un usuario tiene acceso a una ruta basado en su grupo
export const canAccessRoute = (path, user) => {
  // Superusuario: acceso completo
  if (user?.is_superuser) return true;

  // Buscar configuración de permisos para la ruta
  const routeConfig = Object.entries(ROUTE_PERMISSIONS).find(([route]) =>
    path.startsWith(route)
  );

  // Si no hay configuración, se permite el acceso
  if (!routeConfig) return true;

  const [, config] = routeConfig;

  // Verificar si el usuario pertenece a algún grupo autorizado
  return config.groups.length === 0 ||
    config.groups.some(group => user?.groups?.includes(group));
};
