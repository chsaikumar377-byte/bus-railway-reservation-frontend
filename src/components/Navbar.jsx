import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Train, Ticket, User, LogOut, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar no-print">
      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          <div className="brand-icon-box">
            <Bus size={22} />
          </div>
          <span>TravelGo <span style={{ color: '#2dd4bf', fontSize: '0.85em' }}>Reservations</span></span>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
            </li>

            {isAuthenticated && (
              <li>
                <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
                  <Ticket size={17} />
                  My Bookings
                </Link>
              </li>
            )}

            {isAdmin && (
              <li>
                <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                  <ShieldCheck size={17} style={{ color: '#f59e0b' }} />
                  Admin Panel
                </Link>
              </li>
            )}

            {isAuthenticated ? (
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-menu-pill">
                  <div className="user-avatar-circle">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span>{user?.fullName?.split(' ')[0]}</span>
                  {isAdmin && <span className="nav-admin-badge">Admin</span>}
                </div>
                <button
                  onClick={handleLogout}
                  className="nav-btn-outline"
                  title="Sign out"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem' }}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </li>
            ) : (
              <li style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/login" className="nav-btn-outline">
                  Login
                </Link>
                <Link to="/register" className="nav-btn-primary">
                  Register
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
