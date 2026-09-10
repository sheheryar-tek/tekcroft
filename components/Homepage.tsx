"use client";

import { useEffect } from "react";
import assets from "@/lib/asset-manifest.json";

type HomepageProps = {
  html: string;
};

let mmPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function loadMm(): Promise<void> {
  if (!mmPromise) mmPromise = loadScript(assets.mm);
  return mmPromise;
}

function panelFor(btn: Element): HTMLElement | null {
  const id = btn.getAttribute("aria-controls");
  return id ? document.getElementById(id) : null;
}

function wireFaq(root: HTMLElement) {
  const onClick = (e: MouseEvent) => {
    const raw = e.target;
    const t =
      raw instanceof Element
        ? raw
        : raw instanceof Text
          ? raw.parentElement
          : null;
    if (!t) return;
    const btn = t.closest(".faq-q");
    if (!btn || !root.contains(btn)) return;

    const list = btn.closest(".faq-list");
    if (!list) return;

    const panel = panelFor(btn);
    if (!panel) return;

    e.preventDefault();
    const willOpen = btn.getAttribute("aria-expanded") !== "true";

    list.querySelectorAll(".faq-q").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      const p = panelFor(b);
      if (p) {
        p.setAttribute("data-open", "false");
        p.classList.remove("is-open");
      }
    });

    if (willOpen) {
      btn.setAttribute("aria-expanded", "true");
      panel.setAttribute("data-open", "true");
      panel.classList.add("is-open");
      const wrap = list.closest(".faq-wrap");
      if (wrap instanceof HTMLElement) {
        const qs = Array.from(list.querySelectorAll(".faq-q"));
        wrap.dataset.at = String(qs.indexOf(btn) + 1);
      }
    }
  };

  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}

export default function Homepage({ html }: HomepageProps) {
  useEffect(() => {
    const abort = new AbortController();
    const root = document.getElementById("tekcroft-root");

    // Sync open class with server-rendered data-open="true" panels
    root?.querySelectorAll(".faq-a[data-open='true']").forEach((el) => {
      el.classList.add("is-open");
    });

    const unwireFaq = root ? wireFaq(root) : undefined;

    const warm = () => {
      loadMm().catch(console.error);
    };

    const trigger = document.getElementById("mmTrigger");
    const burger = document.querySelector(".js-burger");
    trigger?.addEventListener("pointerenter", warm, {
      once: true,
      signal: abort.signal,
    });
    trigger?.addEventListener("focus", warm, {
      once: true,
      signal: abort.signal,
    });
    burger?.addEventListener("pointerdown", warm, {
      once: true,
      signal: abort.signal,
    });

    if ("requestIdleCallback" in window) {
      (
        window as Window & {
          requestIdleCallback: (
            cb: () => void,
            opts?: { timeout: number }
          ) => number;
        }
      ).requestIdleCallback(warm, { timeout: 2500 });
    } else {
      setTimeout(warm, 1500);
    }

    return () => {
      abort.abort();
      unwireFaq?.();
    };
  }, []);

  return (
    <div
      id="tekcroft-root"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
