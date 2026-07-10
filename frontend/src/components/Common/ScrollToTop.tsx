/** Scroll-to-top-on-navigate utility that resets scroll position on route change. */

import { useEffect } from "react";
import { useLocation } from '@tanstack/react-router';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    // pathname is included to trigger scroll-to-top on every route change
  }, [pathname]);

  return null;
}
