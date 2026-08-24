// RepositoryList.jsx — Grid of the top 5 most-starred repositories

import RepositoryCard from './RepositoryCard';
import './RepositoryList.css';

function RepositoryList({ repos }) {
  // Sort repos by stars (descending), take top 5
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  if (topRepos.length === 0) {
    return (
      <div className="repo-list-section">
        <h3 className="section-title"><span>🏆</span> Most-Starred Repositories</h3>
        <p className="no-repos-msg">No public repositories found.</p>
      </div>
    );
  }

  return (
    <div className="repo-list-section">
      <h3 className="section-title"><span>🏆</span> Most-Starred Repositories</h3>
      <div className="repos-grid">
        {topRepos.map((repo) => (
          <RepositoryCard key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  );
}

export default RepositoryList;
