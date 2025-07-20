// src/components/DebugAuth.jsx
import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

const DebugAuth = () => {
  const { user, loading, error, isAuthenticated } = useAuthContext();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md">
      <h3 className="font-bold text-sm mb-2">Debug Auth State:</h3>
      <div className="text-xs space-y-1">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>User:</strong> {user ? user.username : 'No user'}</p>
        <p><strong>Groups:</strong> {user?.groups?.join(', ') || 'None'}</p>
        <p><strong>Token exists:</strong> {localStorage.getItem('access_token') ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default DebugAuth;