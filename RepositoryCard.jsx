// RepositoryCard.jsx — A single repository card

import './RepositoryCard.css';

// Map language to color dot (same as LanguageSection)
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5',
  Java: '#b07219', 'C++': '#f34b7d', Go: '#00add8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4f5d95', Swift: '#ffac45', Kotlin: '#a97bff',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', default: '#58a6ff',
};

function RepositoryCard({ repo }) {
  // Format dates nicely (e.g., "Jan 2023")
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default;

  return (
    <div className="repo-card glass-card">
      {/* Header: name + stars */}
      <div className="repo-card-header">
        <h4 className="repo-name" title={repo.name}>
          📦 {repo.name}
        </h4>
        <span className="repo-stars">⭐ {repo.stargazers_count.toLocaleString()}</span>
      </div>

      {/* Description */}
      <p className="repo-description">
        {repo.description || 'No description available'}
      </p>

      {/* Meta info row */}
      <div className="repo-meta">
        {repo.language && (
          <span className="repo-language">
            <span
              className="repo-lang-dot"
              style={{ background: langColor }}
            />
            {repo.language}
          </span>
        )}
        <span className="repo-forks">🍴 {repo.forks_count}</span>
      </div>

      {/* Dates */}
      <div className="repo-dates">
        <span>Created: {formatDate(repo.created_at)}</span>
        <span>Updated: {formatDate(repo.updated_at)}</span>
      </div>

      {/* View button */}
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary repo-btn"
      >
        View Repository ↗
      </a>
    </div>
  );
}

export default RepositoryCard;
