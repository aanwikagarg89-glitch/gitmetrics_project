// SearchBar.jsx — Search input with controlled input, validation, and recent searches display

import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, recentSearches, onRecentClick, loading }) {
  // Local state for the text the user types
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState('');

  // Validate username format
  function validate(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Please enter a GitHub username to search.';
    }
    // GitHub username rules: alphanumeric or single hyphens, 1-39 chars, no start/end with hyphen
    const githubRegex = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!githubRegex.test(trimmed)) {
      return 'Username must be 1-39 characters and contain only letters, numbers, or single hyphens.';
    }
    return '';
  }

  // Handle the search button click or Enter key press
  function handleSearch() {
    const errorMsg = validate(inputValue);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }
    setValidationError('');
    onSearch(inputValue.trim());
  }

  // Allow pressing Enter to trigger search
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }

  // Handle input change
  function handleChange(e) {
    setInputValue(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  }

  // Clear the input field
  function handleClear() {
    setInputValue('');
    setValidationError('');
  }

  return (
    <div className="search-section">
      {/* Main Search Box */}
      <div className={`search-box glass-card ${validationError ? 'search-box-invalid' : ''}`}>
        <span className="search-icon">🔍</span>

        <input
          type="text"
          id="username-input"
          className="search-input"
          placeholder="Enter GitHub username (e.g., torvalds, gaearon)..."
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="GitHub username"
          aria-invalid={!!validationError}
          disabled={loading}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Clear button — only shows when there is text */}
        {inputValue && (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
            title="Clear input"
            aria-label="Clear input"
          >
            ✕
          </button>
        )}

        <button
          type="button"
          className="btn-primary search-btn"
          onClick={handleSearch}
          disabled={loading}
          id="search-button"
        >
          {loading ? <span className="btn-spinner" /> : null}
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="search-validation-message" role="alert">
          <span className="validation-icon">⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      {/* Recent Searches — only shown if there are any */}
      {recentSearches && recentSearches.length > 0 && (
        <div className="recent-searches-inline">
          <span className="recent-label">Recent:</span>
          {recentSearches.map((username) => (
            <button
              key={username}
              type="button"
              className="recent-chip"
              onClick={() => {
                setInputValue(username);
                setValidationError('');
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
