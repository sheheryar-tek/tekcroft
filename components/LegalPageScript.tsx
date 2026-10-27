"use client";

import { useEffect } from "react";

type LegalPageScriptProps = {
  rootId: string;
};

/**
 * Pixel-faithful port of source HTML <script id="lp-script">.
 * Behaviour: sticky index active highlight, reading progress bar,
 * smooth scroll with header offset, Print, Back to top, mobile FAB.
 */
export default function LegalPageScript({ rootId }: LegalPageScriptProps) {
  useEffect(() => {
    const r = document.getElementById(rootId);
    if (!r) return;

    // Match the original IIFE as closely as possible (same selectors, offsets, math).
    const links = [].slice.call(
      r.querySelectorAll(".lp-toc a")
    ) as HTMLAnchorElement[];
    const secs = links.map((a) =>
      document.querySelector(a.getAttribute("href") || "")
    ) as (Element | null)[];
    const bar = r.querySelector(".lp-pr i") as HTMLElement | null;
    const td = r.querySelector(".lp-td");
    const mq = window.matchMedia("(max-width:980px)");
    const ol = r.querySelector(".lp-toc ol") as HTMLElement | null;
    let last = -1;
    if (td) td.setAttribute("open", "");

    function on() {
      if (!r || !bar) return;
      const y = window.scrollY + 200;
      let k = 0;
      secs.forEach((s, i) => {
        if (s && (s as HTMLElement).offsetTop <= y) k = i;
      });
      const bd = r.querySelector(".lp-body") as HTMLElement | null;
      if (
        bd &&
        window.scrollY + innerHeight >= bd.offsetTop + bd.offsetHeight - 40
      ) {
        k = secs.length - 1;
      }
      links.forEach((a, i) => {
        a.classList.toggle("on", i === k);
        a.classList.toggle("done", i < k);
      });
      if (mq.matches && k !== last && ol) {
        last = k;
        const a = links[k];
        if (a) {
          ol.scrollBy({
            left:
              a.getBoundingClientRect().left -
              ol.getBoundingClientRect().left -
              16,
            behavior: "smooth",
          });
        }
      }
      const b = r.querySelector(".lp-body") as HTMLElement | null;
      if (b) {
        const p =
          (window.scrollY + innerHeight * 0.4 - b.offsetTop) / b.offsetHeight;
        bar.style.width = Math.max(0, Math.min(1, p)) * 100 + "%";
      }
    }

    window.addEventListener("scroll", on, { passive: true });
    on();

    const fab = r.querySelector(".lp-fab");
    function ff() {
      fab?.classList.toggle("show", window.scrollY > innerHeight);
    }
    window.addEventListener("scroll", ff, { passive: true });
    ff();

    const topClick = (e: Event) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const tops = r.querySelectorAll(".lp-top, .lp-fab");
    tops.forEach((a) => a.addEventListener("click", topClick));

    const pr = r.querySelector(".lp-print");
    const printClick = () => {
      window.print();
    };
    pr?.addEventListener("click", printClick);

    const linkClick = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const t = document.querySelector(a.getAttribute("href") || "");
      if (!t) return;
      e.preventDefault();
      window.scrollTo({
        top:
          t.getBoundingClientRect().top +
          window.scrollY -
          (mq.matches ? 150 : 170),
        behavior: "smooth",
      });
    };
    links.forEach((a) => a.addEventListener("click", linkClick));

    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("scroll", ff);
      tops.forEach((a) => a.removeEventListener("click", topClick));
      pr?.removeEventListener("click", printClick);
      links.forEach((a) => a.removeEventListener("click", linkClick));
    };
  }, [rootId]);

  return null;
}
