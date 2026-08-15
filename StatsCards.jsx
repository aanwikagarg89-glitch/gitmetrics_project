// StatsCards.jsx — 4 analytics summary cards (Repos, Stars, Followers, Following)

import './StatsCards.css';

// Each card definition: icon, label, and which field to read
const CARD_CONFIGS = [
  { icon: '📁', label: 'Total Repos', color: '#58a6ff', bgGlow: 'rgba(88, 166, 255, 0.12)' },
  { icon: '⭐', label: 'Total Stars', color: '#e3b341', bgGlow: 'rgba(227, 179, 65, 0.12)' },
  { icon: '👥', label: 'Followers',   color: '#3fb950', bgGlow: 'rgba(63, 185, 80, 0.12)' },
  { icon: '👤', label: 'Following',   color: '#a371f7', bgGlow: 'rgba(163, 113, 247, 0.12)' },
];

function StatsCards({ user, repos }) {
  // Calculate total stars across all fetched repos
  const totalStars = repos.reduce((total, repo) => total + repo.stargazers_count, 0);

  // Array of values matching the card configs above
  const values = [
    user.public_repos,
    totalStars,
    user.followers,
    user.following,
  ];

  // Format numbers nicely (e.g., 1200 → 1.2K)
  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }

  return (
    <div className="stats-grid">
      {CARD_CONFIGS.map((card, index) => (
        <div
          key={card.label}
          className="stat-card glass-card"
          style={{ '--card-glow': card.bgGlow, '--card-color': card.color }}
        >
          <div className="stat-card-icon" style={{ background: card.bgGlow }}>
            {card.icon}
          </div>
          <div className="stat-card-value">{formatNumber(values[index])}</div>
          <div className="stat-card-label">{card.label}</div>
          {/* Decorative colored line at bottom */}
          <div className="stat-card-bar" style={{ background: card.color }} />
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
