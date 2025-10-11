import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const auth = useSelector((state) => state.auth);
  const user = auth.user;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // unauthorized for this role
    return <div style={{ padding: 20 }}><h3>Forbidden — you do not have access to this page</h3></div>;
  }

  return <Outlet />;
}
