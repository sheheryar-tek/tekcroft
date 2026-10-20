"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

function stripHashFromUrl() {
  if (!window.location.hash) return false;
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
  return true;
}

/** Undo any browser hash jump (load, hashchange, or late layout). */
function killHashAndStayTop() {
  stripHashFromUrl();
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  });
}

function isNavigationalHashHref(href: string | null): boolean {
  if (!href) return false;
  if (href === "#") return true;
  if (href.startsWith("#") && href.length > 1) return true;
  if (href.startsWith("/#")) return true;
  try {
    const u = new URL(href, window.location.href);
    return (
      u.origin === window.location.origin &&
      Boolean(u.hash) &&
      !href.startsWith("mailto:") &&
      !href.startsWith("tel:")
    );
  } catch {
    return false;
  }
}

/**
 * Disable browser hash → section scrolling site-wide.
 * Keeps section ids intact for CSS/animations; never leaves # in the URL.
 */
export default function NoHashScroll() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      /* ignore */
    }

    if (window.location.hash) killHashAndStayTop();

    /* Browser scrolls to the target before hashchange — always undo to top. */
    const onHashChange = () => killHashAndStayTop();
    window.addEventListener("hashchange", onHashChange);

    const onPageShow = () => {
      if (window.location.hash) killHashAndStayTop();
    };
    window.addEventListener("pageshow", onPageShow);

    /* Safety net: never let in-page hash <a> change the URL or jump */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const t = e.target;
      if (!(t instanceof Element)) return;
      const a = t.closest("a[href]");
      if (!a || !document.documentElement.contains(a)) return;
      const href = a.getAttribute("href");
      if (!isNavigationalHashHref(href)) return;
      e.preventDefault();
      try {
        const u = new URL(href!, window.location.href);
        if (
          u.pathname !== window.location.pathname ||
          u.search !== window.location.search
        ) {
          window.location.assign(u.pathname + u.search);
        }
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (window.location.hash) killHashAndStayTop();
  }, [pathname]);

  return null;
}
