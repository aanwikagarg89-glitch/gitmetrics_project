// Header.jsx — Top navigation bar with routing links, brand title, and theme toggle

import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

function Header({ isDark: propIsDark, onToggleTheme: propToggleTheme }) {
  // Support either props or Context API (Context API preferred for Eval 2)
  const themeContext = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeContext.isDark;
  const toggleTheme = propToggleTheme || themeContext.toggleTheme;

  return (
    <header className="header">
      <div className="header-inner">
        {/* App Logo & Title */}
        <Link to="/" className="header-brand" aria-label="GitMetrics Home">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">GitMetrics</span>
        </Link>

        {/* Navigation Links (Topic A) */}
        <nav className="header-nav" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/repositories"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Repositories
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Compare
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Register
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            About
          </NavLink>
        </nav>

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
          <span className="theme-label">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
