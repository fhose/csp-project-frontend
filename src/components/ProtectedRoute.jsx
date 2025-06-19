import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Jika tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak sesuai (misal: mahasiswa akses dashboard), redirect ke default sesuai role
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'mahasiswa') {
      return <Navigate to="/homepage" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
