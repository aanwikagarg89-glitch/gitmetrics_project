// RateLimitBanner.jsx — Displays current GitHub API quota status, reset time countdown,
// stale-data warnings, and simulation toggle for development/viva testing.

import { useState, useEffect } from 'react';
import { useGithub } from '../context/GithubContext';
import './RateLimitBanner.css';

function RateLimitBanner() {
  const {
    rateLimit,
    isStale,
    isFromCache,
    cacheTimestamp,
    isSimulatedRateLimit,
    toggleRateLimitSimulation,
    refreshCurrentUser,
    loading,
    user,
  } = useGithub();

  const [timeRemaining, setTimeRemaining] = useState('');
  const [showSimModal, setShowSimModal] = useState(false);

  // Update live countdown to reset time
  useEffect(() => {
    if (!rateLimit?.reset) return;

    function updateCountdown() {
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(0, rateLimit.reset - now);
      if (diff <= 0) {
        setTimeRemaining('Resetting now...');
      } else {
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setTimeRemaining(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [rateLimit]);

  // Format cache time
  function formatCacheTime(ts) {
    if (!ts) return 'recently';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const remaining = rateLimit?.remaining !== null && rateLimit?.remaining !== undefined
    ? rateLimit.remaining
    : 60;
  const limit = rateLimit?.limit || 60;
  const isExhausted = remaining === 0 || rateLimit?.isExhausted;

  return (
    <div className="rate-limit-wrapper">
      {/* Stale Cache Warning Banner */}
      {isStale && (
        <div className="stale-cache-alert glass-card fade-in" role="alert">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Stale Data Fallback Active:</strong> GitHub API rate limit is currently
              reached or network is throttled. Displaying cached metrics saved at{' '}
              {formatCacheTime(cacheTimestamp)}.
              {rateLimit?.resetDate && (
                <span className="reset-hint"> Quota resets at {rateLimit.resetDate} ({timeRemaining}).</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary alert-refresh-btn"
            onClick={refreshCurrentUser}
            disabled={loading || (isExhausted && !isSimulatedRateLimit)}
            title={isExhausted ? `Quota exhausted. Please wait ${timeRemaining}` : 'Fetch fresh data'}
          >
            🔄 Try Fresh Fetch
          </button>
        </div>
      )}

      {/* Subtle Cache & Quota Status Bar */}
      <div className="quota-bar glass-card">
        <div className="quota-left">
          <div className="quota-indicator" title="GitHub unauthenticated API rate quota">
            <span className={`quota-dot ${isExhausted ? 'dot-danger' : remaining < 15 ? 'dot-warning' : 'dot-good'}`} />
            <span className="quota-label">API Quota:</span>
            <strong className="quota-numbers">{remaining}/{limit} remaining</strong>
            {rateLimit?.resetDate && (
              <span className="quota-reset">(resets {rateLimit.resetDate})</span>
            )}
          </div>

          {isFromCache && !isStale && user && (
            <div className="cached-badge" title="Data loaded from memory/sessionStorage cache">
              <span>⚡ Cached at {formatCacheTime(cacheTimestamp)}</span>
              <button
                type="button"
                className="cache-refresh-btn"
                onClick={refreshCurrentUser}
                disabled={loading}
                title="Bypass cache and fetch fresh data from GitHub"
              >
                🔄 Refresh
              </button>
            </div>
          )}
        </div>

        <div className="quota-right">
          {/* Safe Simulation Toggle Button for Viva/Exam */}
          <button
            type="button"
            className={`sim-toggle-pill ${isSimulatedRateLimit ? 'sim-active' : ''}`}
            onClick={() => setShowSimModal(!showSimModal)}
            title="Simulate rate limit safely for testing"
          >
            {isSimulatedRateLimit ? '🧪 Rate Limit Sim: ON' : '⚙️ Rate Limit Test'}
          </button>
        </div>
      </div>

      {/* Dev Simulation Modal */}
      {showSimModal && (
        <div className="sim-modal-card glass-card fade-in">
          <div className="sim-modal-header">
            <h4>🧪 Rate-Limit Test Simulator</h4>
            <button
              type="button"
              className="sim-modal-close"
              onClick={() => setShowSimModal(false)}
            >
              ✕
            </button>
          </div>
          <p className="sim-modal-text">
            For college evaluations, safely simulate GitHub's 403 HTTP Rate Limit (60 req/hr)
            without exhausting your real IP quota. Tests how GitMetrics falls back to cached
            data, displays quota countdowns, and disables redundant requests.
          </p>
          <div className="sim-modal-actions">
            {!isSimulatedRateLimit ? (
              <button
                type="button"
                className="btn-primary sim-enable-btn"
                onClick={() => {
                  toggleRateLimitSimulation(true);
                  setShowSimModal(false);
                }}
              >
                Activate Rate Limit Simulation (0/60)
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary sim-disable-btn"
                onClick={() => {
                  toggleRateLimitSimulation(false);
                  setShowSimModal(false);
                }}
              >
                Reset to Real API Quota
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RateLimitBanner;
