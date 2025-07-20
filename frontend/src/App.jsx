// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './auth/Login';
import RequireAuth from './Components/RequireAuth';
import RedirectIfAuth from './Components/RedirectIfAuth';
import UserDashboard from './users/UserDashboard';

import UsersPage from './pages/users/UsersPage';
import CreateUser from './pages/users/CreateUser';
import EditUser from './pages/users/EditUser';
import ViewUser from './pages/users/ViewUser';

import GroupsPage from './pages/groups/GroupsPage';
import CreateGroup from './pages/groups/CreateGroup';
import EditGroup from './pages/groups/EditGroup';
import ViewGroup from './pages/groups/ViewGroup';

import RoomsPage from './pages/rooms/RoomsPage';
import CreateRoom from './pages/rooms/CreateRoom';
import EditRoom from './pages/rooms/EditRoom';
import ViewRoom from './pages/rooms/ViewRoom';

import ClientsPage from './pages/clients/ClientsPage';
import CreateClient from './pages/clients/CreateClient';
import EditClient from './pages/clients/EditClient';
import ViewClient from './pages/clients/ViewClient';

// ✅ NUEVO: Importar componente de Reports
import ReportsPage from './pages/reports/ReportsPage';

import { useSessionManager } from './hooks/useSessionManager';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import PermissionGuard from './Components/PermissionGuard';
import AuthLoadingWrapper from './Components/AuthLoadingWrapper';
import MainLayout from './Components/layout/MainLayout';

const AuthLoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-6">
      <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent shadow-lg"></div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Verifying access...</h2>
        <p className="text-blue-100">Please wait a moment</p>
      </div>
    </div>
  </div>
);

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Dashboard */}
        <Route path="dashboard" element={<UserDashboard />} />

        {/* Users */}
        <Route path="users" element={<PermissionGuard><UsersPage /></PermissionGuard>} />
        <Route path="users/create" element={<PermissionGuard><CreateUser /></PermissionGuard>} />
        <Route path="users/edit/:id" element={<PermissionGuard><EditUser /></PermissionGuard>} />
        <Route path="users/view/:id" element={<PermissionGuard><ViewUser /></PermissionGuard>} />

        {/* Groups */}
        <Route path="groups" element={<PermissionGuard><GroupsPage /></PermissionGuard>} />
        <Route path="groups/create" element={<PermissionGuard><CreateGroup /></PermissionGuard>} />
        <Route path="groups/edit/:id" element={<PermissionGuard><EditGroup /></PermissionGuard>} />
        <Route path="groups/view/:id" element={<PermissionGuard><ViewGroup /></PermissionGuard>} />

        {/* Rooms */}
        <Route path="rooms" element={<PermissionGuard><RoomsPage /></PermissionGuard>} />
        <Route path="rooms/create" element={<PermissionGuard><CreateRoom /></PermissionGuard>} />
        <Route path="rooms/edit/:id" element={<PermissionGuard><EditRoom /></PermissionGuard>} />
        <Route path="rooms/view/:id" element={<PermissionGuard><ViewRoom /></PermissionGuard>} />

        {/* Clients */}
        <Route path="clients" element={<PermissionGuard><ClientsPage /></PermissionGuard>} />
        <Route path="clients/create" element={<PermissionGuard><CreateClient /></PermissionGuard>} />
        <Route path="clients/edit/:id" element={<PermissionGuard><EditClient /></PermissionGuard>} />
        <Route path="clients/view/:id" element={<PermissionGuard><ViewClient /></PermissionGuard>} />

        {/* ✅ NUEVO: Reports - Solo una ruta porque es una página con tabs internos */}
        <Route path="reports" element={<PermissionGuard><ReportsPage /></PermissionGuard>} />

        {/* Admin */}
        <Route
          path="admin"
          element={
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Administration</h2>
              <p className="text-gray-600">Admin panel under construction...</p>
            </div>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

function AppContent() {
  useSessionManager();
  const { user, loading } = useAuthContext();

  if (loading) return <AuthLoadingScreen />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />

      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/*"
        element={
          <RequireAuth>
            <ProtectedRoutes />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <AuthLoadingWrapper>
          <AppContent />
        </AuthLoadingWrapper>
      </Router>
    </AuthProvider>
  );
}

export default AppWrapper;