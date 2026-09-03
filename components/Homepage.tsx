"use client";

import { useEffect } from "react";

type HomepageProps = {
  html: string;
};

let scriptsStarted = false;

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

export default function Homepage({ html }: HomepageProps) {
  useEffect(() => {
    if (scriptsStarted) return;
    scriptsStarted = true;

    let cancelled = false;

    (async () => {
      try {
        await loadScript("/tekcroft-main.js");
        if (cancelled) return;
        await loadScript("/tekcroft-mm.js");
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
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
