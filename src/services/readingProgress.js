/**
 * Mentico Student Reading Progress & Learning Journey Service
 * Scoped per authenticated student and book deliverable.
 * Supports instant localStorage retrieval with debounced Firestore cloud synchronization.
 */

import { isRealFirebaseConfigured } from './firebase';

export const BOOK_CHAPTERS = [
  { id: 1, page: 1, endPage: 7, title: 'Introduction: The Social Freedom Mindset' },
  { id: 2, page: 8, endPage: 21, title: 'Module 1: Confidence Architecture & Anxiety Erasure' },
  { id: 3, page: 22, endPage: 39, title: 'Module 2: The Conversation Engine (7 Core Steps)' },
  { id: 4, page: 40, endPage: 57, title: 'Module 3: Ethical Attraction & Reading Reciprocity' },
  { id: 5, page: 58, endPage: 73, title: 'Module 4: Rejection Alchemy & Unshakeable Composure' },
  { id: 6, page: 74, endPage: 85, title: 'Module 5: The 30-Day Social Freedom Challenge' },
  { id: 7, page: 86, endPage: 90, title: 'Module 6: Summary Cheat Sheets & Final Field Cards' },
];

export const TOTAL_BOOK_PAGES = 90;

/**
 * Returns the chapter currently being read based on page number
 */
export function getChapterForPage(page = 1) {
  const p = Math.max(1, Math.min(TOTAL_BOOK_PAGES, Number(page) || 1));
  for (let i = BOOK_CHAPTERS.length - 1; i >= 0; i--) {
    if (p >= BOOK_CHAPTERS[i].page) {
      return BOOK_CHAPTERS[i];
    }
  }
  return BOOK_CHAPTERS[0];
}

/**
 * Calculates how many chapters have been completed
 * A chapter is completed if the reader has advanced beyond its endPage
 */
export function getCompletedChaptersCount(page = 1) {
  const p = Math.max(1, Number(page) || 1);
  return BOOK_CHAPTERS.filter((ch) => p > ch.endPage || (ch.id === BOOK_CHAPTERS.length && p >= ch.endPage)).length;
}

/**
 * Get local storage storage key for student reading progress
 */
function getStorageKey(userId, bookId = 'social-freedom') {
  const safeUser = String(userId || 'guest_student').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `mentico_reading_progress_${safeUser}_${bookId}`;
}

/**
 * Formats a relative timestamp (e.g., 'Just now', 'Today', 'Yesterday', '3 days ago')
 */
export function formatRelativeActivity(isoDateString) {
  if (!isoDateString) return 'Not started yet';
  try {
    const activityDate = new Date(isoDateString);
    const now = new Date();
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24 && now.getDate() === activityDate.getDate()) return 'Today';
    if (diffDays <= 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return activityDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

/**
 * Computes calendar date string YYYY-MM-DD in student's local timezone
 */
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates updated reading streak based on last active reading date
 */
function calculateUpdatedStreak(previousStreak = 0, lastReadingDate = null) {
  const today = getLocalDateString(new Date());

  if (!lastReadingDate) {
    return 1;
  }

  if (lastReadingDate === today) {
    // Already read today, maintain existing streak
    return Math.max(1, previousStreak || 1);
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = getLocalDateString(yesterday);

  if (lastReadingDate === yesterdayString) {
    // Consecutive day reading! Increment streak
    return (previousStreak || 0) + 1;
  }

  // Missed a day or more: reset streak to 1 for today's new active session
  return 1;
}

/**
 * Load reading progress for a given student & book
 */
export function getReadingProgress(userId, bookId = 'social-freedom') {
  const key = getStorageKey(userId, bookId);
  let localData = null;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[ReadingProgress] Error reading localStorage:', err);
  }

  const lastPage = Math.max(1, Number(localData?.lastPage) || 1);
  const totalPages = Math.max(TOTAL_BOOK_PAGES, Number(localData?.totalPages) || TOTAL_BOOK_PAGES);
  const currentChapter = getChapterForPage(lastPage);
  const completedChapters = getCompletedChaptersCount(lastPage);
  const isStarted = Boolean(localData?.isStarted || localData?.lastOpenedAt || lastPage > 1);
  const progressPercentage = isStarted ? Math.min(100, Math.round((lastPage / totalPages) * 100)) : 0;

  return {
    userId,
    bookId,
    lastPage: isStarted ? lastPage : 1,
    totalPages,
    progressPercentage,
    completedChapters,
    currentChapterTitle: currentChapter?.title || BOOK_CHAPTERS[0].title,
    currentChapterNumber: currentChapter?.id || 1,
    lastOpenedAt: localData?.lastOpenedAt || null,
    lastReadingDate: localData?.lastReadingDate || null,
    totalReadingTimeSeconds: Number(localData?.totalReadingTimeSeconds) || 0,
    readingStreak: isStarted ? Math.max(1, Number(localData?.readingStreak) || 1) : 0,
    isStarted,
  };
}

let firestoreSyncTimeout = null;

/**
 * Save updated reading progress (called on page navigation or timer ticks)
 */
export function saveReadingProgress(userId, bookId = 'social-freedom', updates = {}) {
  if (!userId) return;

  const current = getReadingProgress(userId, bookId);
  const key = getStorageKey(userId, bookId);

  const newLastPage = updates.lastPage ? Math.max(1, Math.min(TOTAL_BOOK_PAGES, Number(updates.lastPage))) : current.lastPage;
  const newTotalPages = updates.totalPages ? Number(updates.totalPages) : current.totalPages;
  const nowIso = new Date().toISOString();
  const todayDate = getLocalDateString(new Date());

  // Check if meaningful activity happened (page change or time elapsed)
  const isStarted = true;
  const newStreak = calculateUpdatedStreak(current.readingStreak, current.lastReadingDate);
  const newReadingTime = current.totalReadingTimeSeconds + (Number(updates.additionalSeconds) || 0);

  const updatedProgress = {
    userId,
    bookId,
    lastPage: newLastPage,
    totalPages: newTotalPages,
    progressPercentage: Math.min(100, Math.round((newLastPage / newTotalPages) * 100)),
    completedChapters: getCompletedChaptersCount(newLastPage),
    currentChapterTitle: getChapterForPage(newLastPage).title,
    currentChapterNumber: getChapterForPage(newLastPage).id,
    lastOpenedAt: nowIso,
    lastReadingDate: todayDate,
    totalReadingTimeSeconds: newReadingTime,
    readingStreak: newStreak,
    isStarted,
  };

  // Immediate write to localStorage for instant UI responsiveness
  try {
    localStorage.setItem(key, JSON.stringify(updatedProgress));
    // Trigger custom event so other components on page (e.g. Dashboard) can react immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mentico:reading-progress-updated', { detail: updatedProgress }));
    }
  } catch (err) {
    console.warn('[ReadingProgress] Error saving to localStorage:', err);
  }

  // Debounced write to Firestore to prevent excessive cloud writes
  if (isRealFirebaseConfigured && userId && !userId.startsWith('guest_')) {
    if (firestoreSyncTimeout) {
      clearTimeout(firestoreSyncTimeout);
    }

    firestoreSyncTimeout = setTimeout(async () => {
      try {
        const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const { getApp } = await import('firebase/app');
        const db = getFirestore(getApp());
        const progressDocRef = doc(db, 'users', userId, 'readingProgress', bookId);

        await setDoc(
          progressDocRef,
          {
            ...updatedProgress,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (cloudErr) {
        // Non-blocking fallback: local copy is already authoritative
        console.warn('[ReadingProgress] Cloud sync deferred:', cloudErr?.message);
      }
    }, 1500);
  }

  return updatedProgress;
}

