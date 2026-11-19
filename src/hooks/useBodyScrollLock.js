import { useEffect, useRef } from 'react';

/**
 * Custom React hook for locking background body scroll on mobile devices (iOS Safari & Android Chrome)
 * and desktop browsers.
 * - Preserves the exact page scroll position without jumping.
 * - Prevents background scroll leakage while allowing internal scrolling within overlays.
 * - Compensates for desktop scrollbar width to eliminate layout shift.
 * - Restores original scroll position upon unlocking.
 * - Cleans up all modified styles on unmount or browser back navigation.
 *
 * @param {boolean} isLocked - Whether scroll should be locked
 * @param {Function} [onClose] - Optional callback to close on escape key or back navigation
 */
export function useBodyScrollLock(isLocked, onClose) {
  const scrollOffsetRef = useRef(0);
  const onCloseRef = useRef(onClose);

  // Keep latest onClose callback reference without re-running effect
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isLocked) return;

    // 1. Capture current scroll position and scrollbar width
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    scrollOffsetRef.current = scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // 2. Save original inline styles to restore accurately later
    const originalBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // 3. Apply scroll lock on body & html
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.setAttribute('data-menu-open', 'true');

    // 4. Handle Escape key and Browser Back (popstate)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && typeof onCloseRef.current === 'function') {
        onCloseRef.current();
      }
    };

    const handlePopState = () => {
      if (typeof onCloseRef.current === 'function') {
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    // 5. Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);

      // Remove global flag
      document.body.removeAttribute('data-menu-open');

      // Restore inline styles
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalBodyStyles.position;
      document.body.style.top = originalBodyStyles.top;
      document.body.style.left = originalBodyStyles.left;
      document.body.style.right = originalBodyStyles.right;
      document.body.style.width = originalBodyStyles.width;
      document.body.style.overflow = originalBodyStyles.overflow;
      document.body.style.paddingRight = originalBodyStyles.paddingRight;

      // Restore exact scroll position without smooth scrolling animation jump
      const prevScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollOffsetRef.current);
      document.documentElement.style.scrollBehavior = prevScrollBehavior;
    };
  }, [isLocked]);
}
