// RepoModal.jsx — Accessible repository details modal dialog with integrated notes/bookmark CRUD

import { useState, useEffect } from 'react';
import { useBookmarks } from '../context/BookmarksContext';
import { useToast } from '../context/ToastContext';
import './RepoModal.css';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5',
  Java: '#b07219', 'C++': '#f34b7d', Go: '#00add8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4f5d95', Swift: '#ffac45', Kotlin: '#a97bff',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', default: '#58a6ff',
};

function RepoModal({ repo, onClose }) {
  const { isBookmarked, getBookmark, addBookmark, updateBookmark, removeBookmark } = useBookmarks();
  const { addToast } = useToast();

  const bookmarked = repo ? isBookmarked(repo.id) : false;
  const existingBookmark = repo ? getBookmark(repo.id) : null;

  // Local state for personal note and category tag
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('Reference');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Sync state when modal opens or repo changes
  useEffect(() => {
    if (existingBookmark) {
      setNote(existingBookmark.note || '');
      setTag(existingBookmark.tag || 'Reference');
    } else {
      setNote('');
      setTag('Reference');
      setIsEditingNote(false);
    }
  }, [repo, existingBookmark]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!repo) return null;

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function handleSaveBookmark() {
    if (bookmarked) {
      updateBookmark(repo.id, note, tag);
      setIsEditingNote(false);
      addToast(`Updated notes for "${repo.name}"`, 'success');
    } else {
      addBookmark(repo, note, tag);
      setIsEditingNote(false);
      addToast(`Saved "${repo.name}" to local bookmarks!`, 'success');
    }
  }

  function handleRemoveBookmark() {
    removeBookmark(repo.id);
    setNote('');
    setIsEditingNote(false);
    addToast(`Removed "${repo.name}" from bookmarks`, 'info');
  }

  const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default;

  return (
    <div
      className="modal-overlay fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-repo-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge">Repository Details</span>
            <h2 id="modal-repo-title" className="modal-title">
              📦 {repo.name}
            </h2>
            {repo.owner && (
              <span className="modal-owner">by @{repo.owner.login || repo.owner}</span>
            )}
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal dialog"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Description */}
          <p className="modal-desc">
            {repo.description || 'No description provided for this repository.'}
          </p>

          {/* Quick Metrics Grid */}
          <div className="modal-stats-grid">
            <div className="modal-stat-card">
              <span className="stat-icon">⭐</span>
              <span className="stat-num">{repo.stargazers_count?.toLocaleString() || 0}</span>
              <span className="stat-label">Stars</span>
            </div>
            <div className="modal-stat-card">
              <span className="stat-icon">🍴</span>
              <span className="stat-num">{repo.forks_count?.toLocaleString() || 0}</span>
              <span className="stat-label">Forks</span>
            </div>
            <div className="modal-stat-card">
              <span className="stat-icon">🐞</span>
              <span className="stat-num">{repo.open_issues_count?.toLocaleString() || 0}</span>
              <span className="stat-label">Open Issues</span>
            </div>
            <div className="modal-stat-card">
              <span className="stat-icon">👁️</span>
              <span className="stat-num">{repo.watchers_count?.toLocaleString() || 0}</span>
              <span className="stat-label">Watchers</span>
            </div>
          </div>

          {/* Details Metadata List */}
          <div className="modal-meta-list">
            <div className="modal-meta-item">
              <span className="meta-label">Primary Language:</span>
              <span className="meta-value">
                {repo.language ? (
                  <span className="repo-language">
                    <span className="repo-lang-dot" style={{ background: langColor }} />
                    {repo.language}
                  </span>
                ) : (
                  'Not specified'
                )}
              </span>
            </div>

            <div className="modal-meta-item">
              <span className="meta-label">Default Branch:</span>
              <span className="meta-value"><code>{repo.default_branch || 'main'}</code></span>
            </div>

            <div className="modal-meta-item">
              <span className="meta-label">License:</span>
              <span className="meta-value">
                {repo.license?.name || repo.license?.spdx_id || 'No license specified'}
              </span>
            </div>

            <div className="modal-meta-item">
              <span className="meta-label">Created Date:</span>
              <span className="meta-value">{formatDate(repo.created_at)}</span>
            </div>

            <div className="modal-meta-item">
              <span className="meta-label">Last Updated:</span>
              <span className="meta-value">{formatDate(repo.updated_at)}</span>
            </div>
          </div>

          {/* CRUD Personal Notes / Bookmarks Section */}
          <div className="modal-crud-section glass-card">
            <div className="crud-header">
              <h4 className="crud-title">
                <span>🔖</span> Personal Study Notes (Local CRUD)
              </h4>
              <span className="crud-badge">Saved in Local Storage</span>
            </div>

            {bookmarked && !isEditingNote ? (
              <div className="saved-note-view">
                <div className="saved-note-tag-row">
                  <span className="category-pill">{existingBookmark?.tag || 'Reference'}</span>
                  <span className="saved-date">
                    Saved {formatDate(existingBookmark?.savedAt)}
                  </span>
                </div>
                <p className="saved-note-text">
                  {existingBookmark?.note || 'No custom notes written yet.'}
                </p>
                <div className="saved-note-actions">
                  <button
                    type="button"
                    className="btn-secondary note-action-btn"
                    onClick={() => setIsEditingNote(true)}
                  >
                    ✏️ Edit Note
                  </button>
                  <button
                    type="button"
                    className="btn-secondary note-delete-btn"
                    onClick={handleRemoveBookmark}
                  >
                    🗑️ Remove Bookmark
                  </button>
                </div>
              </div>
            ) : (
              <div className="note-edit-form">
                <div className="note-form-row">
                  <label htmlFor="bookmark-tag-select" className="note-label">Tag:</label>
                  <select
                    id="bookmark-tag-select"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="bookmark-tag-select"
                  >
                    <option value="Study">📚 Study</option>
                    <option value="Reference">💡 Reference</option>
                    <option value="Project">🚀 Project</option>
                    <option value="Favorite">⭐ Favorite</option>
                  </select>
                </div>

                <div className="note-form-row">
                  <label htmlFor="bookmark-note-input" className="note-label">Personal Note:</label>
                  <textarea
                    id="bookmark-note-input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your study notes, key takeaways, or todo items for this repository..."
                    rows={3}
                    className="bookmark-note-textarea"
                  />
                </div>

                <div className="note-form-buttons">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSaveBookmark}
                  >
                    💾 {bookmarked ? 'Update Note' : 'Save Bookmark & Note'}
                  </button>
                  {isEditingNote && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsEditingNote(false)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary modal-github-link"
          >
            Open on GitHub ↗
          </a>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RepoModal;
