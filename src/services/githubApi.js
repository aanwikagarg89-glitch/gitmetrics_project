// githubApi.js — Centralized GitHub API service with intelligent TTL caching,
// rate-limit header parsing, stale-data fallback, and test simulation mode.

const CACHE_PREFIX = 'gitmetrics_cache_';
const RATE_LIMIT_KEY = 'gitmetrics_rate_limit';
const SIMULATE_KEY = 'gitmetrics_sim_ratelimit';
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes cache expiration

// In-memory listeners for rate-limit updates
const rateLimitListeners = new Set();

export function subscribeRateLimit(listener) {
  rateLimitListeners.add(listener);
  return () => rateLimitListeners.delete(listener);
}

function notifyRateLimit(info) {
  rateLimitListeners.forEach((fn) => {
    try {
      fn(info);
    } catch {
      // ignore
    }
  });
}

// Read current cached rate-limit metrics
export function getStoredRateLimit() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const now = Math.floor(Date.now() / 1000);
    const secondsUntilReset = Math.max(0, (parsed.reset || 0) - now);
    return {
      ...parsed,
      secondsUntilReset,
      isExhausted: parsed.remaining === 0 && secondsUntilReset > 0,
    };
  } catch {
    return null;
  }
}

// Update stored rate-limit from response headers
function updateRateLimitFromHeaders(headers) {
  if (!headers) return null;

  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');
  const retryAfter = headers.get('retry-after');

  if (limit === null && remaining === null) return null;

  const resetEpoch = reset ? parseInt(reset, 10) : Math.floor(Date.now() / 1000) + 60;
  const now = Math.floor(Date.now() / 1000);
  const secondsUntilReset = retryAfter ? parseInt(retryAfter, 10) : Math.max(0, resetEpoch - now);

  const info = {
    limit: limit ? parseInt(limit, 10) : 60,
    remaining: remaining !== null ? parseInt(remaining, 10) : null,
    reset: resetEpoch,
    resetDate: new Date(resetEpoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    secondsUntilReset,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(info));
  } catch {
    // ignore
  }

  notifyRateLimit(info);
  return info;
}

// Development simulation of rate limit (safe testing without making 60 calls)
export function getSimulationMode() {
  try {
    return localStorage.getItem(SIMULATE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSimulationMode(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(SIMULATE_KEY, 'true');
      const resetEpoch = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
      const simInfo = {
        limit: 60,
        remaining: 0,
        reset: resetEpoch,
        resetDate: new Date(resetEpoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        secondsUntilReset: 120,
        updatedAt: Date.now(),
        simulated: true,
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(simInfo));
      notifyRateLimit(simInfo);
    } else {
      localStorage.removeItem(SIMULATE_KEY);
      localStorage.removeItem(RATE_LIMIT_KEY);
      notifyRateLimit(null);
    }
  } catch {
    // ignore
  }
}

// Cache helpers
function getCachedData(key) {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const isExpired = Date.now() > (parsed.expiresAt || 0);
    return {
      data: parsed.data,
      cachedAt: parsed.cachedAt,
      isExpired,
    };
  } catch {
    return null;
  }
}

function setCachedData(key, data, ttlMs = DEFAULT_TTL_MS) {
  try {
    const entry = {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (e) {
    console.warn('SessionStorage cache write failed:', e);
  }
}

export function clearCacheForUser(username) {
  const clean = username.toLowerCase().trim();
  sessionStorage.removeItem(`${CACHE_PREFIX}user_${clean}`);
  sessionStorage.removeItem(`${CACHE_PREFIX}repos_${clean}`);
}

export function clearAllApiCache() {
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // ignore
  }
}

/**
 * Fetch GitHub user profile with caching and rate limit monitoring.
 */
export async function fetchUserProfile(username, { forceRefresh = false } = {}) {
  const cleanName = (username || '').trim().toLowerCase();
  if (!cleanName) throw new Error('EMPTY_USERNAME');

  // Check cache first
  const cacheKey = `user_${cleanName}`;
  const cached = getCachedData(cacheKey);

  if (!forceRefresh && cached && !cached.isExpired) {
    return {
      data: cached.data,
      fromCache: true,
      isStale: false,
      cachedAt: cached.cachedAt,
    };
  }

  // Check simulation mode
  if (getSimulationMode()) {
    if (cached) {
      return {
        data: cached.data,
        fromCache: true,
        isStale: true,
        cachedAt: cached.cachedAt,
        simulatedRateLimit: true,
      };
    }
    const err = new Error('RATE_LIMIT_EXCEEDED');
    err.status = 403;
    err.isRateLimit = true;
    err.simulated = true;
    throw err;
  }

  // Check if primary rate limit is known to be exhausted
  const currentRateLimit = getStoredRateLimit();
  if (!forceRefresh && currentRateLimit && currentRateLimit.isExhausted) {
    if (cached) {
      return {
        data: cached.data,
        fromCache: true,
        isStale: true,
        cachedAt: cached.cachedAt,
        rateLimitExhausted: true,
      };
    }
    const err = new Error('RATE_LIMIT_EXCEEDED');
    err.status = 403;
    err.isRateLimit = true;
    err.rateLimitInfo = currentRateLimit;
    throw err;
  }

  // Execute Network Request
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanName)}`);
    const rateLimitInfo = updateRateLimitFromHeaders(res.headers);

    if (res.status === 404) {
      const err = new Error('USER_NOT_FOUND');
      err.status = 404;
      throw err;
    }

    if (res.status === 403 || res.status === 429) {
      // Check if it's a rate limit error
      const isRateLimit = rateLimitInfo?.remaining === 0 || res.status === 429;
      if (cached) {
        return {
          data: cached.data,
          fromCache: true,
          isStale: true,
          cachedAt: cached.cachedAt,
          rateLimitExceeded: isRateLimit,
        };
      }
      const err = new Error(isRateLimit ? 'RATE_LIMIT_EXCEEDED' : 'FORBIDDEN');
      err.status = res.status;
      err.isRateLimit = isRateLimit;
      err.rateLimitInfo = rateLimitInfo;
      throw err;
    }

    if (!res.ok) {
      const err = new Error(`HTTP_${res.status}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    setCachedData(cacheKey, data);

    return {
      data,
      fromCache: false,
      isStale: false,
      rateLimitInfo,
    };
  } catch (err) {
    // Network / offline fallback to stale cache if available
    if (cached && (err.name === 'TypeError' || err.message === 'Failed to fetch')) {
      return {
        data: cached.data,
        fromCache: true,
        isStale: true,
        cachedAt: cached.cachedAt,
        networkOffline: true,
      };
    }
    throw err;
  }
}

/**
 * Fetch GitHub user repositories (up to 100, updated order) with caching and rate limit monitoring.
 */
export async function fetchUserRepos(username, { forceRefresh = false } = {}) {
  const cleanName = (username || '').trim().toLowerCase();
  if (!cleanName) return { data: [], fromCache: false };

  const cacheKey = `repos_${cleanName}`;
  const cached = getCachedData(cacheKey);

  if (!forceRefresh && cached && !cached.isExpired) {
    return {
      data: cached.data,
      fromCache: true,
      isStale: false,
      cachedAt: cached.cachedAt,
    };
  }

  // Simulation mode
  if (getSimulationMode()) {
    if (cached) {
      return {
        data: cached.data,
        fromCache: true,
        isStale: true,
        cachedAt: cached.cachedAt,
      };
    }
    const err = new Error('RATE_LIMIT_EXCEEDED');
    err.status = 403;
    err.isRateLimit = true;
    throw err;
  }

  // Rate limit exhausted check
  const currentRateLimit = getStoredRateLimit();
  if (!forceRefresh && currentRateLimit && currentRateLimit.isExhausted) {
    if (cached) {
      return {
        data: cached.data,
        fromCache: true,
        isStale: true,
        cachedAt: cached.cachedAt,
      };
    }
    const err = new Error('RATE_LIMIT_EXCEEDED');
    err.status = 403;
    err.isRateLimit = true;
    throw err;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(cleanName)}/repos?per_page=100&sort=updated`
    );
    const rateLimitInfo = updateRateLimitFromHeaders(res.headers);

    if (!res.ok) {
      if ((res.status === 403 || res.status === 429) && cached) {
        return {
          data: cached.data,
          fromCache: true,
          isStale: true,
          cachedAt: cached.cachedAt,
        };
      }
      return { data: [], fromCache: false, rateLimitInfo };
    }

    const data = await res.json();
    setCachedData(cacheKey, data);

    return {
      data,
      fromCache: false,
      isStale: false,
      rateLimitInfo,
    };
  } catch {
    if (cached) {
      return {
        data: cached.data,
        fromCache: true,
        isStale: true,
        cachedAt: cached.cachedAt,
      };
    }
    return { data: [], fromCache: false };
  }
}
