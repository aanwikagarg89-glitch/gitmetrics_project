// ProfileCard.jsx — Displays the GitHub user's profile info

import './ProfileCard.css';

function ProfileCard({ user }) {
  // Format the date to a human-readable string (e.g., "March 2020")
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Format large numbers (e.g., 1200 → 1.2K)
  function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  return (
    <div className="profile-card glass-card fade-in-up">
      {/* Left: Avatar */}
      <div className="profile-avatar-section">
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          className="profile-avatar"
          loading="lazy"
        />
        <a
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary profile-github-btn"
          id="view-profile-btn"
        >
          View GitHub Profile ↗
        </a>
      </div>

      {/* Right: Info */}
      <div className="profile-info">
        {/* Name & Username */}
        <div className="profile-header">
          <h2 className="profile-name">{user.name || user.login}</h2>
          <span className="profile-username">@{user.login}</span>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="profile-bio">{user.bio}</p>
        )}
        {!user.bio && (
          <p className="profile-bio profile-bio--empty">No bio available</p>
        )}

        {/* Details row */}
        <div className="profile-details">
          {user.location && (
            <span className="profile-detail">
              <span>📍</span> {user.location}
            </span>
          )}
          {user.company && (
            <span className="profile-detail">
              <span>🏢</span> {user.company.replace('@', '')}
            </span>
          )}
          <span className="profile-detail">
            <span>📅</span> Joined {formatDate(user.created_at)}
          </span>
        </div>

        {/* Stats row */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-value">{formatNumber(user.followers)}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="stat-value">{formatNumber(user.following)}</span>
            <span className="stat-label">Following</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="stat-value">{formatNumber(user.public_repos)}</span>
            <span className="stat-label">Repositories</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
