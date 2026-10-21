"use client";

import { useEffect } from "react";

/**
 * Wires the franchise-covers expanding panels (file tm-script behaviour).
 * Markup lives in lib/franchise-seo-body.html #franchise-covers.
 */
export default function FranchiseCovers() {
  useEffect(() => {
    const root = document.getElementById("franchise-covers");
    if (!root) return;
    const rail = root.querySelector<HTMLElement>("[data-tm]");
    if (!rail) return;
    // Prevent the page bundle's generic [data-tm] init from double-binding.
    if (rail.dataset.tmWired === "1") return;
    rail.dataset.tmWired = "1";

    const items = Array.from(rail.querySelectorAll<HTMLElement>(".tm-item"));
    items.forEach((el) => {
      if (el.querySelector(".tm-prog")) return;
      const b = document.createElement("span");
      b.className = "tm-prog";
      b.setAttribute("aria-hidden", "true");
      el.appendChild(b);
    });

    let at = 0;
    let timer: ReturnType<typeof setInterval> | null = null;
    let held = false;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(i: number) {
      at = (i + items.length) % items.length;
      items.forEach((el, k) => {
        const on = k === at;
        el.classList.toggle("on", on);
        el.setAttribute("aria-selected", String(on));
        if (on) {
          const b = el.querySelector<HTMLElement>(".tm-prog");
          if (b) {
            b.style.animation = "none";
            void b.offsetWidth;
            b.style.animation = "";
          }
        }
      });
    }

    function stop() {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    }

    function play() {
      stop();
      rail.classList.remove("paused");
      if (!held && !reduce) {
        timer = setInterval(() => {
          show(at + 1);
        }, 6000);
      }
    }

    function hold() {
      held = true;
      stop();
      rail.classList.add("paused");
      if (holdTimer != null) clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        held = false;
        play();
      }, 12000);
    }

    const onEnter = (i: number) => () => {
      show(i);
    };
    const onClick = (i: number) => () => {
      hold();
      show(i);
    };
    const onKey = (i: number) => (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hold();
        show(i);
        return;
      }
      const to =
        e.key === "ArrowRight" || e.key === "ArrowDown"
          ? i + 1
          : e.key === "ArrowLeft" || e.key === "ArrowUp"
            ? i - 1
            : -1;
      if (to < 0 || to >= items.length) return;
      e.preventDefault();
      items[to].focus();
      hold();
      show(to);
    };

    const enterHandlers: Array<() => void> = [];
    const clickHandlers: Array<() => void> = [];
    const keyHandlers: Array<(e: KeyboardEvent) => void> = [];

    items.forEach((el, i) => {
      const enter = onEnter(i);
      const click = onClick(i);
      const key = onKey(i);
      enterHandlers.push(enter);
      clickHandlers.push(click);
      keyHandlers.push(key);
      el.addEventListener("mouseenter", enter);
      el.addEventListener("click", click);
      el.addEventListener("keydown", key);
    });

    const onRailEnter = () => {
      stop();
      rail.classList.add("paused");
    };
    const onRailLeave = () => {
      rail.classList.remove("paused");
      if (!held) play();
    };
    rail.addEventListener("mouseenter", onRailEnter);
    rail.addEventListener("mouseleave", onRailLeave);

    show(0);

    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) play();
          else stop();
        });
      },
      { threshold: 0.25 }
    );
    io.observe(rail);

    return () => {
      stop();
      if (holdTimer != null) clearTimeout(holdTimer);
      io.disconnect();
      rail.removeEventListener("mouseenter", onRailEnter);
      rail.removeEventListener("mouseleave", onRailLeave);
      items.forEach((el, i) => {
        el.removeEventListener("mouseenter", enterHandlers[i]);
        el.removeEventListener("click", clickHandlers[i]);
        el.removeEventListener("keydown", keyHandlers[i]);
      });
      delete rail.dataset.tmWired;
    };
  }, []);

  return null;
}
