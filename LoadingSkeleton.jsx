// LoadingSkeleton.jsx — Skeleton loading placeholders while API data is fetching

import './LoadingSkeleton.css';

// A single shimmer block (reusable helper)
function SkeletonBlock({ width = '100%', height = '16px', borderRadius = '8px' }) {
  return (
    <div
      className="skeleton-block"
      style={{ width, height, borderRadius }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="skeleton-wrapper fade-in">

      {/* Skeleton: Profile Card */}
      <div className="skeleton-profile glass-card">
        <div className="skeleton-avatar" />
        <div className="skeleton-profile-info">
          <SkeletonBlock width="60%" height="28px" />
          <SkeletonBlock width="35%" height="16px" />
          <SkeletonBlock width="80%" height="14px" />
          <SkeletonBlock width="70%" height="14px" />
          <div className="skeleton-stats-row">
            <SkeletonBlock width="80px" height="48px" borderRadius="12px" />
            <SkeletonBlock width="80px" height="48px" borderRadius="12px" />
            <SkeletonBlock width="80px" height="48px" borderRadius="12px" />
          </div>
        </div>
      </div>

      {/* Skeleton: Stats Cards */}
      <div className="skeleton-stats-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-stat-card glass-card">
            <SkeletonBlock width="40px" height="40px" borderRadius="12px" />
            <SkeletonBlock width="55%" height="32px" />
            <SkeletonBlock width="70%" height="14px" />
          </div>
        ))}
      </div>

      {/* Skeleton: Charts */}
      <div className="skeleton-charts-grid">
        <div className="glass-card skeleton-chart-card">
          <SkeletonBlock width="50%" height="18px" />
          <div className="skeleton-circle" />
        </div>
        <div className="glass-card skeleton-chart-card">
          <SkeletonBlock width="55%" height="18px" />
          <div className="skeleton-bar-chart">
            {[70, 50, 90, 40, 65, 80, 35].map((h, i) => (
              <div key={i} className="skeleton-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton: Repo Cards */}
      <SkeletonBlock width="180px" height="22px" />
      <div className="skeleton-repos-grid">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card skeleton-repo-card">
            <SkeletonBlock width="70%" height="18px" />
            <SkeletonBlock width="100%" height="14px" />
            <SkeletonBlock width="85%" height="14px" />
            <SkeletonBlock width="40%" height="12px" />
            <SkeletonBlock width="100px" height="32px" borderRadius="50px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
