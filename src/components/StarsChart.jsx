// StarsChart.jsx — Bar chart showing stars per top repo

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './StarsChart.css';

// Register Chart.js bar chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StarsChart({ repos, isDark }) {
  // Sort repos by stars, take top 5 with at least 1 star
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .filter((repo) => repo.stargazers_count > 0)
    .slice(0, 5);

  if (topRepos.length === 0) {
    return (
      <div className="chart-card glass-card">
        <h3 className="section-title"><span>📊</span> Stars Per Repository</h3>
        <div className="chart-empty">No starred repositories found</div>
      </div>
    );
  }

  // Shorten long repo names for readability
  const labels = topRepos.map((r) =>
    r.name.length > 14 ? r.name.slice(0, 14) + '…' : r.name
  );
  const starCounts = topRepos.map((r) => r.stargazers_count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Stars',
        data: starCounts,
        backgroundColor: 'rgba(88, 166, 255, 0.25)',
        borderColor: '#58a6ff',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(88, 166, 255, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            // Show the full repo name in tooltip
            const index = items[0].dataIndex;
            return topRepos[index].name;
          },
          label: (item) => ` ⭐ ${item.parsed.y.toLocaleString()} stars`,
        },
        backgroundColor: isDark ? '#161b22' : '#ffffff',
        titleColor: isDark ? '#e6edf3' : '#1c2128',
        bodyColor: isDark ? '#8b949e' : '#424a53',
        borderColor: isDark ? '#30363d' : '#d0d7de',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? '#8b949e' : '#424a53',
          font: { size: 11, family: 'Inter' },
          maxRotation: 30,
        },
        grid: { display: false },
        border: { color: isDark ? '#30363d' : '#d0d7de' },
      },
      y: {
        ticks: {
          color: isDark ? '#8b949e' : '#424a53',
          font: { size: 11, family: 'Inter' },
        },
        grid: {
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-card glass-card">
      <h3 className="section-title"><span>📊</span> Stars Per Repository</h3>
      <div className="bar-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default StarsChart;
