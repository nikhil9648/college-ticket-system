import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: '🏠 Dashboard' },
    { to: '/tickets/new', label: '➕ New Ticket' },
    { to: '/tickets', label: '🎫 My Tickets' },
  ];

  const departmentLinks = [
    { to: '/department/dashboard', label: '🏠 Dashboard' },
    { to: '/department/tickets', label: '🎫 All Tickets' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: '🏠 Dashboard' },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/admin/departments', label: '🏢 Departments' },
    { to: '/admin/analytics', label: '📊 Analytics' },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'department_staff'
      ? departmentLinks
      : studentLinks;

  return (
    <aside className="sidebar">
      <ul className="sidebar-nav">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
