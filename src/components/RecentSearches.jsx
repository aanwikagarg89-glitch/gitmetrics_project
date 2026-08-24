// RecentSearches.jsx — Show and manage recent username searches

import './RecentSearches.css';

function RecentSearches({ searches, onSelect, onClear }) {
  if (searches.length === 0) {
    return null; // Nothing to show when there are no searches yet
  }

  return (
    <div className="recent-section glass-card">
      <div className="recent-header">
        <h3 className="section-title" style={{ marginBottom: 0 }}>
          <span>🕐</span> Recent Searches
        </h3>
        <button
          className="clear-all-btn"
          onClick={onClear}
          title="Clear all recent searches"
        >
          Clear All
        </button>
      </div>

      <div className="recent-list">
        {searches.map((username) => (
          <button
            key={username}
            className="recent-item"
            onClick={() => onSelect(username)}
          >
            <span className="recent-item-icon">👤</span>
            <span className="recent-item-name">{username}</span>
            <span className="recent-item-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecentSearches;
