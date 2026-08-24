// Header.jsx — Top navigation bar with app title and theme toggle

import './Header.css';

function Header({ isDark, onToggleTheme }) {
  return (
    <header className="header">
      <div className="header-inner">
        {/* App Logo & Title */}
        <div className="header-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">GitMetrics</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
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
