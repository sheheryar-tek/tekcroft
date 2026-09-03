"use client";

import { useEffect } from "react";
import assets from "@/lib/asset-manifest.json";

type HomepageProps = {
  html: string;
};

let scriptsStarted = false;
let mmPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-tekcroft="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.tekcroft = src;
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
    if (scriptsStarted) return;
    scriptsStarted = true;

    let cancelled = false;
    const abort = new AbortController();

    (async () => {
      try {
        await loadScript(assets.main);
        if (cancelled) return;

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
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
      abort.abort();
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
