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

export default function Homepage({ html }: HomepageProps) {
  useEffect(() => {
    const abort = new AbortController();

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

    return () => abort.abort();
  }, []);

  return (
    <div
      id="tekcroft-root"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
