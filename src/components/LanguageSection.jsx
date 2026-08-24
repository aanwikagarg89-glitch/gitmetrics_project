// LanguageSection.jsx — Top 5 programming languages list

import './LanguageSection.css';

// Language-to-color mapping (GitHub's official colors for popular languages)
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572a5',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
  'C#':       '#239120',
  Go:         '#00add8',
  Rust:       '#dea584',
  Ruby:       '#701516',
  PHP:        '#4f5d95',
  Swift:      '#ffac45',
  Kotlin:     '#a97bff',
  Dart:       '#00b4ab',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Shell:      '#89e051',
  Vue:        '#41b883',
  default:    '#58a6ff',
};

// Get top 5 languages sorted by repository count
function getTopLanguages(repos) {
  const langCount = {};

  repos.forEach((repo) => {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  });

  return Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

function LanguageSection({ repos }) {
  const topLanguages = getTopLanguages(repos);

  if (topLanguages.length === 0) {
    return (
      <div className="language-section glass-card">
        <h3 className="section-title"><span>💻</span> Top Languages</h3>
        <p className="no-data">No language data available</p>
      </div>
    );
  }

  // Max count (used to draw progress bars proportionally)
  const maxCount = topLanguages[0][1];

  return (
    <div className="language-section glass-card">
      <h3 className="section-title"><span>💻</span> Top Programming Languages</h3>

      <div className="language-list">
        {topLanguages.map(([lang, count], index) => {
          const color = LANG_COLORS[lang] || LANG_COLORS.default;
          const percentage = Math.round((count / maxCount) * 100);

          return (
            <div key={lang} className="language-item">
              {/* Rank + name */}
              <div className="language-left">
                <span className="language-rank">{index + 1}</span>
                <span
                  className="language-dot"
                  style={{ background: color }}
                />
                <span className="language-name">{lang}</span>
              </div>

              {/* Progress bar + count */}
              <div className="language-right">
                <div className="language-bar-track">
                  <div
                    className="language-bar-fill"
                    style={{ width: `${percentage}%`, background: color }}
                  />
                </div>
                <span className="language-count">{count} repos</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LanguageSection;
