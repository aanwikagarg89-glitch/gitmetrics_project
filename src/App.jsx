// App.jsx — Root Application with Context Providers and React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { GithubProvider } from './context/GithubContext';
import { BookmarksProvider } from './context/BookmarksContext';
import { ToastProvider } from './context/ToastContext';

// Navigation & Pages
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import RepositoriesPage from './pages/RepositoriesPage';
import ComparePage from './pages/ComparePage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';
function AppContent() {
  const { isDark } = useTheme();
  return (
    <div className="app" data-theme={isDark ? 'dark' : 'light'}>
      {/* Sticky top navigation bar */}
      <Header />
      {/* Main page content routed via React Router */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <BookmarksProvider>
            <GithubProvider>
              <AppContent />
            </GithubProvider>
          </BookmarksProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
