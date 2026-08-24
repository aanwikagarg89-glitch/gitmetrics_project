// App.jsx — Main application component
// Manages state, API calls, and renders all sections

import { useState, useEffect } from 'react';

// Components
import Header        from './components/Header';
import SearchBar     from './components/SearchBar';
import ProfileCard   from './components/ProfileCard';
import StatsCards    from './components/StatsCards';
import LanguageChart from './components/LanguageChart';
import StarsChart    from './components/StarsChart';
import Timeline      from './components/Timeline';
import LanguageSection  from './components/LanguageSection';
import RepositoryList   from './components/RepositoryList';
import RecentSearches   from './components/RecentSearches';
import LoadingSkeleton  from './components/LoadingSkeleton';
import ErrorMessage     from './components/ErrorMessage';

import './App.css';

// ---- Local Storage Keys ----
const THEME_KEY   = 'gitmetrics_theme';
const SEARCH_KEY  = 'gitmetrics_recent';
const MAX_RECENT  = 5; // Maximum recent searches to store

function App() {
  // ---- State ----
  const [isDark,         setIsDark]         = useState(true);    // dark/light theme
  const [user,           setUser]           = useState(null);    // GitHub user object
  const [repos,          setRepos]          = useState([]);      // array of repos
  const [loading,        setLoading]        = useState(false);   // API loading state
  const [error,          setError]          = useState(null);    // error type string
  const [recentSearches, setRecentSearches] = useState([]);      // list of recent usernames

  // ---- On mount: load saved theme and recent searches from Local Storage ----
  useEffect(() => {
    // Load saved theme preference (or use system preference)
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      // Respect system preference as default
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }

    // Load saved recent searches
    const savedSearches = localStorage.getItem(SEARCH_KEY);
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // ---- Apply theme to the document ----
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  // ---- Toggle between dark and light mode ----
  function handleToggleTheme() {
    setIsDark((prev) => !prev);
  }

  // ---- Save a username to the recent searches list ----
  function saveRecentSearch(username) {
    setRecentSearches((prev) => {
      // Remove duplicate if already exists, then add to the front
      const filtered = prev.filter((u) => u.toLowerCase() !== username.toLowerCase());
      const updated = [username, ...filtered].slice(0, MAX_RECENT);

      // Persist to Local Storage
      localStorage.setItem(SEARCH_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  // ---- Clear all recent searches ----
  function handleClearRecent() {
    setRecentSearches([]);
    localStorage.removeItem(SEARCH_KEY);
  }

  // ---- Main search function: fetch profile + repos from GitHub API ----
  async function handleSearch(username) {
    // Check if input is empty
    if (!username) {
      setError('empty');
      setUser(null);
      setRepos([]);
      return;
    }

    // Don't search if already loading
    if (loading) return;

    // Reset state for a fresh search
    setLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);

    try {
      // Fetch user profile
      const profileResponse = await fetch(`https://api.github.com/users/${username}`);

      // Handle different error status codes
      if (profileResponse.status === 404) {
        setError('not_found');
        return;
      }
      if (profileResponse.status === 403) {
        setError('rate_limit');
        return;
      }
      if (!profileResponse.ok) {
        setError('default');
        return;
      }

      const profileData = await profileResponse.json();

      // Fetch repositories (up to 100, sorted by most recently updated)
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
      );

      let reposData = [];
      if (reposResponse.ok) {
        reposData = await reposResponse.json();
      }

      // Update state with the fetched data
      setUser(profileData);
      setRepos(reposData);

      // Save this search to recent history
      saveRecentSearch(username);

    } catch {
      // This catches network errors (no internet, etc.)
      setError('network');
    } finally {
      // Always turn off loading, even if there was an error
      setLoading(false);
    }
  }

  // ---- Render ----
  return (
    <div className="app" data-theme={isDark ? 'dark' : 'light'}>
      {/* Sticky top navigation */}
      <Header isDark={isDark} onToggleTheme={handleToggleTheme} />

      <main className="main-content">
        {/* Search bar + recent chips */}
        <SearchBar
          onSearch={handleSearch}
          recentSearches={recentSearches}
          onRecentClick={handleSearch}
          loading={loading}
        />

        {/* Loading skeleton */}
        {loading && <LoadingSkeleton />}

        {/* Error state */}
        {!loading && error && (
          <ErrorMessage type={error} />
        )}

        {/* Dashboard — only shown when we have data */}
        {!loading && !error && user && (
          <div className="dashboard fade-in">

            {/* Profile card */}
            <ProfileCard user={user} />

            {/* Analytics summary cards */}
            <StatsCards user={user} repos={repos} />

            {/* Charts: Language Doughnut + Stars Bar */}
            <div className="charts-grid">
              <LanguageChart repos={repos} isDark={isDark} />
              <StarsChart    repos={repos} isDark={isDark} />
            </div>

            {/* Repository creation timeline */}
            <Timeline repos={repos} isDark={isDark} />

            {/* Top 5 languages list */}
            <LanguageSection repos={repos} />

            {/* Top starred repositories */}
            <RepositoryList repos={repos} />

            {/* Recent searches panel */}
            <RecentSearches
              searches={recentSearches}
              onSelect={handleSearch}
              onClear={handleClearRecent}
            />
          </div>
        )}

        {/* Hero section: shown when no search has been done yet and no error */}
        {!loading && !error && !user && (
          <div className="hero-section">
            <span className="hero-icon">⚡</span>
            <h1 className="hero-title">GitHub Profile Analytics</h1>
            <p className="hero-subtitle">
              Enter any GitHub username to instantly generate a beautiful analytics
              dashboard with charts, repository stats, and language insights.
            </p>
            <div className="hero-features">
              <span className="hero-feature-badge">📊 Language Charts</span>
              <span className="hero-feature-badge">⭐ Star Analytics</span>
              <span className="hero-feature-badge">📅 Timeline View</span>
              <span className="hero-feature-badge">🌙 Dark / Light Mode</span>
              <span className="hero-feature-badge">📱 Responsive Design</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
