// LanguageChart.jsx — Doughnut chart showing language distribution

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './LanguageChart.css';

// Register Chart.js components (required by react-chartjs-2)
ChartJS.register(ArcElement, Tooltip, Legend);

// Color palette for the chart slices
const COLORS = [
  '#58a6ff', '#a371f7', '#3fb950', '#e3b341',
  '#f78166', '#79c0ff', '#d2a8ff', '#56d364',
];

// Calculate language frequency from all repos
function getLanguageData(repos) {
  const langCount = {};

  repos.forEach((repo) => {
    if (repo.language) {
      // Add 1 for each repo using this language
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  });

  // Sort by count descending, then take top 5
  const sorted = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sorted;
}

function LanguageChart({ repos, isDark }) {
  const languageData = getLanguageData(repos);

  // If no language data found, show fallback
  if (languageData.length === 0) {
    return (
      <div className="chart-card glass-card">
        <h3 className="section-title"><span>🌐</span> Language Distribution</h3>
        <div className="chart-empty">No language data available</div>
      </div>
    );
  }

  const labels = languageData.map(([lang]) => lang);
  const data = languageData.map(([, count]) => count);
  const total = data.reduce((sum, n) => sum + n, 0);

  // Chart.js data object
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: COLORS.slice(0, labels.length),
        borderColor: isDark ? '#161b22' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#8b949e' : '#424a53',
          padding: 16,
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.parsed;
            const percent = ((count / total) * 100).toFixed(1);
            return ` ${context.label}: ${count} repos (${percent}%)`;
          },
        },
        backgroundColor: isDark ? '#161b22' : '#ffffff',
        titleColor: isDark ? '#e6edf3' : '#1c2128',
        bodyColor: isDark ? '#8b949e' : '#424a53',
        borderColor: isDark ? '#30363d' : '#d0d7de',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="chart-card glass-card">
      <h3 className="section-title"><span>🌐</span> Language Distribution</h3>
      <div className="doughnut-wrapper">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

export default LanguageChart;
