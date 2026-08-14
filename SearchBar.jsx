// SearchBar.jsx — Search input with recent searches display

import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, recentSearches, onRecentClick, loading }) {
  // Local state for the text the user types
  const [inputValue, setInputValue] = useState('');

  // Handle the search button click or Enter key press
  function handleSearch() {
    onSearch(inputValue.trim());
  }

  // Allow pressing Enter to trigger search
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  // Clear the input field
  function handleClear() {
    setInputValue('');
  }

  return (
    <div className="search-section">
      {/* Main Search Box */}
      <div className="search-box glass-card">
        <span className="search-icon">🔍</span>

        <input
          type="text"
          id="username-input"
          className="search-input"
          placeholder="Enter GitHub username..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="GitHub username"
          disabled={loading}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Clear button — only shows when there is text */}
        {inputValue && (
          <button
            className="clear-btn"
            onClick={handleClear}
            title="Clear input"
            aria-label="Clear input"
          >
            ✕
          </button>
        )}

        <button
          className="btn-primary search-btn"
          onClick={handleSearch}
          disabled={loading}
          id="search-button"
        >
          {loading ? <span className="btn-spinner" /> : null}
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Recent Searches — only shown if there are any */}
      {recentSearches.length > 0 && (
        <div className="recent-searches-inline">
          <span className="recent-label">Recent:</span>
          {recentSearches.map((username) => (
            <button
              key={username}
              className="recent-chip"
              onClick={() => {
                setInputValue(username);
                onRecentClick(username);
              }}
            >
              {username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
