// ErrorMessage.jsx — Displays error messages with icons, helpful text, and retry action

import './ErrorMessage.css';

// Map error types to icons and messages
const ERROR_CONFIGS = {
  not_found: {
    icon: '🔍',
    title: 'User Not Found',
    message: 'The requested GitHub username does not exist. Please check the spelling and try again.',
  },
  rate_limit: {
    icon: '⏳',
    title: 'API Rate Limit Reached',
    message: 'GitHub limits unauthenticated REST requests to 60/hr per IP. Please wait a minute and try again.',
  },
  network: {
    icon: '📡',
    title: 'Network Error',
    message: 'Unable to connect to GitHub. Please check your internet connection and try again.',
  },
  empty: {
    icon: '✏️',
    title: 'Username Required',
    message: 'Please enter a GitHub username to search.',
  },
  invalid: {
    icon: '⚠️',
    title: 'Invalid Username Format',
    message: 'Usernames must only contain alphanumeric characters or hyphens (max 39 characters).',
  },
  default: {
    icon: '⚠️',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred while fetching GitHub data. Please try again.',
  },
};

function ErrorMessage({ type = 'default', customMessage = '', onRetry }) {
  const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.default;

  return (
    <div className="error-container fade-in" role="alert">
      <div className="error-icon">{config.icon}</div>
      <h3 className="error-title">{config.title}</h3>
      <p className="error-message">{customMessage || config.message}</p>
      {onRetry && (
        <button
          type="button"
          className="btn-primary error-retry-btn"
          onClick={onRetry}
        >
          🔄 Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
