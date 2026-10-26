// GithubContext.jsx — Central state management for GitHub API data with robust caching,
// rate-limit quota tracking, manual refresh, stale-data fallback, and simulation support.
/* oxlint-disable react/only-export-components */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchUserProfile,
  fetchUserRepos,
  getStoredRateLimit,
  subscribeRateLimit,
  getSimulationMode,
  setSimulationMode as setApiSimulationMode,
} from '../services/githubApi';

const GithubContext = createContext();

const SEARCH_KEY = 'gitmetrics_recent';
const MAX_RECENT = 5;

export function GithubProvider({ children }) {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // 'not_found' | 'rate_limit' | 'network' | 'empty' | 'invalid' | 'default'
  const [lastSearchedUsername, setLastSearchedUsername] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);

  // Cache & Rate Limit States
  const [isStale, setIsStale] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  const [rateLimit, setRateLimit] = useState(() => getStoredRateLimit());
  const [isSimulatedRateLimit, setIsSimulatedRateLimit] = useState(() => getSimulationMode());

  // Listen to rate limit header updates
  useEffect(() => {
    const unsubscribe = subscribeRateLimit((info) => {
      setRateLimit(info);
    });
    return unsubscribe;
  }, []);

  // Recent searches initialized from localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(SEARCH_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_KEY, JSON.stringify(recentSearches));
    } catch (e) {
      console.error('Failed to save recent searches', e);
    }
  }, [recentSearches]);

  function saveRecentSearch(username) {
    setRecentSearches((prev) => {
      const filtered = prev.filter((u) => u.toLowerCase() !== username.toLowerCase());
      return [username, ...filtered].slice(0, MAX_RECENT);
    });
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem(SEARCH_KEY);
  }

  // Toggle rate limit simulation for safe viva/development testing
  function toggleRateLimitSimulation(enable) {
    setApiSimulationMode(enable);
    setIsSimulatedRateLimit(enable);
  }

  // Main search function using centralized githubApi with caching
  const searchUser = useCallback(async (rawUsername, { forceRefresh = false } = {}) => {
    const username = (rawUsername || '').trim();

    if (!username) {
      setError('empty');
      setUser(null);
      setRepos([]);
      setIsStale(false);
      return;
    }

    const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!githubUsernameRegex.test(username)) {
      setError('invalid');
      setUser(null);
      setRepos([]);
      setIsStale(false);
      return;
    }

    if (loading) return;

    setLastSearchedUsername(username);
    setLoading(true);
    setError(null);

    try {
      // Fetch profile with caching
      const userResult = await fetchUserProfile(username, { forceRefresh });
      // Fetch repositories with caching
      const reposResult = await fetchUserRepos(username, { forceRefresh });

      setUser(userResult.data);
      setRepos(reposResult.data || []);
      setIsStale(userResult.isStale || false);
      setIsFromCache(userResult.fromCache || false);
      setCacheTimestamp(userResult.cachedAt || Date.now());

      saveRecentSearch(username);
    } catch (err) {
      if (err.isRateLimit || err.message === 'RATE_LIMIT_EXCEEDED') {
        setError('rate_limit');
      } else if (err.status === 404 || err.message === 'USER_NOT_FOUND') {
        setError('not_found');
        setUser(null);
        setRepos([]);
      } else if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
        setError('network');
        setUser(null);
        setRepos([]);
      } else {
        setError('default');
        setUser(null);
        setRepos([]);
      }
      setIsStale(false);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Force fresh API request bypassing cache
  const refreshCurrentUser = useCallback(() => {
    if (user?.login || lastSearchedUsername) {
      searchUser(user?.login || lastSearchedUsername, { forceRefresh: true });
    }
  }, [user, lastSearchedUsername, searchUser]);

  // Retry last search
  const retryLastSearch = useCallback(() => {
    if (lastSearchedUsername) {
      searchUser(lastSearchedUsername, { forceRefresh: true });
    }
  }, [lastSearchedUsername, searchUser]);

  return (
    <GithubContext.Provider
      value={{
        user,
        repos,
        loading,
        error,
        recentSearches,
        lastSearchedUsername,
        selectedRepo,
        setSelectedRepo,
        searchUser,
        refreshCurrentUser,
        retryLastSearch,
        clearRecentSearches,
        // Rate limit and caching telemetry
        rateLimit,
        isStale,
        isFromCache,
        cacheTimestamp,
        isSimulatedRateLimit,
        toggleRateLimitSimulation,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
}

export function useGithub() {
  const context = useContext(GithubContext);
  if (!context) {
    throw new Error('useGithub must be used within a GithubProvider');
  }
  return context;
}
