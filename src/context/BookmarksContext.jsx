// BookmarksContext.jsx — Implements a complete local CRUD workflow
// Allows users to bookmark repositories and maintain personal notes/tags
// Saved in localStorage (Frontend-only demonstration; does not mutate GitHub)
/* oxlint-disable react/only-export-components */

import { createContext, useContext, useState, useEffect } from 'react';


const BookmarksContext = createContext();

const BOOKMARKS_KEY = 'gitmetrics_bookmarks';

export function BookmarksProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with localStorage whenever bookmarks change
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  // CREATE: Add new bookmark with optional note and category tag
  function addBookmark(repo, note = '', tag = 'Reference') {
    if (!repo || !repo.id) return false;

    setBookmarks((prev) => {
      // If already exists, return unchanged
      if (prev.some((b) => b.id === repo.id)) return prev;

      const newBookmark = {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name || `${repo.owner?.login || ''}/${repo.name}`,
        owner: repo.owner?.login || 'unknown',
        html_url: repo.html_url,
        description: repo.description || 'No description provided',
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        language: repo.language || 'Plain text',
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        note: note.trim(),
        tag: tag || 'Reference',
        savedAt: new Date().toISOString(),
      };

      return [newBookmark, ...prev];
    });
    return true;
  }

  // READ: Helper to check if repository is already bookmarked
  function isBookmarked(repoId) {
    return bookmarks.some((b) => b.id === repoId);
  }

  // READ: Helper to get specific bookmark by repository ID
  function getBookmark(repoId) {
    return bookmarks.find((b) => b.id === repoId) || null;
  }

  // UPDATE: Update personal note and tag for an existing bookmark
  function updateBookmark(repoId, updatedNote, updatedTag) {
    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === repoId
          ? {
              ...b,
              note: updatedNote !== undefined ? updatedNote.trim() : b.note,
              tag: updatedTag !== undefined ? updatedTag : b.tag,
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
  }

  // DELETE: Remove bookmark by repository ID
  function removeBookmark(repoId) {
    setBookmarks((prev) => prev.filter((b) => b.id !== repoId));
  }

  // Clear all bookmarks
  function clearAllBookmarks() {
    setBookmarks([]);
  }

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks,
        addBookmark,
        isBookmarked,
        getBookmark,
        updateBookmark,
        removeBookmark,
        clearAllBookmarks,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
