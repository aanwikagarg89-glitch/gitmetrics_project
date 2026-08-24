// ErrorMessage.jsx — Displays error messages with icons and helpful text

import './ErrorMessage.css';

// Map error types to icons and messages
const ERROR_CONFIGS = {
  not_found: {
    icon: '🔍',
    title: 'User Not Found',
    message: 'Please check the username and try again.',
  },
  rate_limit: {
    icon: '⏳',
    title: 'API Rate Limit Reached',
    message: 'GitHub limits unauthenticated requests. Please wait a minute and try again.',
  },
  network: {
    icon: '📡',
    title: 'Network Error',
    message: 'Unable to connect to GitHub. Please check your internet connection.',
  },
  empty: {
    icon: '✏️',
    title: 'Username Required',
    message: 'Please enter a GitHub username to search.',
  },
  default: {
    icon: '⚠️',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

function ErrorMessage({ type = 'default', customMessage = '' }) {
  const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.default;

  return (
    <div className="error-container fade-in">
      <div className="error-icon">{config.icon}</div>
      <h3 className="error-title">{config.title}</h3>
      <p className="error-message">{customMessage || config.message}</p>
    </div>
  );
}

export default ErrorMessage;
