// Timeline.jsx — Repository creation timeline (repos created per year)

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Timeline.css';

// Make sure these are registered (safe to register multiple times)
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Calculate how many repos were created each year
function getTimelineData(repos) {
  const yearCount = {};

  repos.forEach((repo) => {
    // Extract year from the created_at field (e.g., "2022-04-15T10:00:00Z")
    const year = new Date(repo.created_at).getFullYear().toString();
    yearCount[year] = (yearCount[year] || 0) + 1;
  });

  // Sort years ascending
  const sortedYears = Object.keys(yearCount).sort();
  const counts = sortedYears.map((year) => yearCount[year]);

  return { sortedYears, counts };
}

function Timeline({ repos, isDark }) {
  const { sortedYears, counts } = getTimelineData(repos);

  if (sortedYears.length === 0) {
    return (
      <div className="timeline-card glass-card">
        <h3 className="section-title"><span>📅</span> Repository Creation Timeline</h3>
        <div className="chart-empty">No timeline data available</div>
      </div>
    );
  }

  const chartData = {
    labels: sortedYears,
    datasets: [
      {
        label: 'Repositories Created',
        data: counts,
        backgroundColor: 'rgba(163, 113, 247, 0.3)',
        borderColor: '#a371f7',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(163, 113, 247, 0.6)',
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
          label: (item) => ` 📁 ${item.parsed.y} repositories`,
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
          font: { size: 12, family: 'Inter' },
        },
        grid: { display: false },
        border: { color: isDark ? '#30363d' : '#d0d7de' },
      },
      y: {
        ticks: {
          color: isDark ? '#8b949e' : '#424a53',
          stepSize: 1,
          font: { size: 12, family: 'Inter' },
        },
        grid: {
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  // Summary stats
  const totalYears = sortedYears.length;
  const mostActiveYear = sortedYears[counts.indexOf(Math.max(...counts))];

  return (
    <div className="timeline-card glass-card">
      <div className="timeline-header">
        <h3 className="section-title"><span>📅</span> Repository Creation Timeline</h3>
        <div className="timeline-summary">
          <span className="timeline-badge">
            🗓️ {totalYears} year{totalYears !== 1 ? 's' : ''} active
          </span>
          <span className="timeline-badge">
            🔥 Most active: {mostActiveYear}
          </span>
        </div>
      </div>
      <div className="timeline-chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default Timeline;
