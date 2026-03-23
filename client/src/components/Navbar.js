import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, updateAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      updateAuth(null, null);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      updateAuth(null, null);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎓 College Ticket System
      </Link>
      {user && (
        <div className="navbar-menu">
          <div className="navbar-user">
            <span>👤 {user.name}</span>
            <span
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                textTransform: 'capitalize',
              }}
            >
              {user.role?.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
