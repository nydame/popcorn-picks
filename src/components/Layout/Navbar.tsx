import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Sparkles, Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/search', label: 'Search', icon: Search },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/recommendations', label: 'AI Picks', icon: Sparkles },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/search" className="navbar-brand">
          <span className="brand-icon">🍿</span>
          <span className="brand-text">Popcorn Picks</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? 'nav-link-active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {user && (
            <div className="user-info">
              <User size={14} />
              <span className="user-email">{user.email?.split('@')[0]}</span>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="icon-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && (
            <button onClick={signOut} className="icon-btn" aria-label="Sign out">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
