import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TicketForm from './components/TicketForm';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TicketDetails from './pages/TicketDetails';

import './index.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, authenticated } = useAuth();
  if (!authenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppLayout = ({ children }) => (
  <div className="app-container">
    <Navbar />
    <div className="main-layout">
      <Sidebar />
      <main className="page-content">{children}</main>
    </div>
  </div>
);

const HomeRedirect = () => {
  const { user, authenticated } = useAuth();
  if (!authenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'department_staff')
    return <Navigate to="/department/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '8px', fontSize: '14px' },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Home redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Student routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <AppLayout>
                  <StudentDashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <AppLayout>
                  <StudentDashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <AppLayout>
                  <TicketForm />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <AppLayout>
                  <TicketDetails />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Department routes */}
          <Route
            path="/department/dashboard"
            element={
              <PrivateRoute allowedRoles={['department_staff', 'admin']}>
                <AppLayout>
                  <DepartmentDashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/department/tickets"
            element={
              <PrivateRoute allowedRoles={['department_staff', 'admin']}>
                <AppLayout>
                  <DepartmentDashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
