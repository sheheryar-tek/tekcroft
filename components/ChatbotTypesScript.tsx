"use client";

import { useEffect } from "react";

/**
 * Pixel-faithful port of source <script id="ct-script"> for #chatbot-types:
 * tab switching, 6.5s autoplay + progress, hover pause, IntersectionObserver,
 * arrow keys, and mobile swipe (autoplay off below 860px).
 */
export default function ChatbotTypesScript() {
  useEffect(() => {
    const r = document.getElementById("chatbot-types");
    if (!r) return;

    const bs = [].slice.call(r.querySelectorAll(".tt")) as HTMLElement[];
    const ps = [].slice.call(r.querySelectorAll(".pn")) as HTMLElement[];
    let k = 0;
    let t: ReturnType<typeof setInterval> | null = null;
    let hold = false;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = r.querySelector(".ct-tabs") as HTMLElement | null;
    if (!tl) return;

    function set(i: number, f?: boolean) {
      k = i;
      bs.forEach((b, j) => {
        const on = j === i;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
      });
      ps.forEach((p, j) => {
        p.hidden = j !== i;
        p.classList.toggle("on", j === i);
      });
      [].forEach.call(r!.querySelectorAll(".ct-dots i"), (d, j) => {
        (d as HTMLElement).classList.toggle("on", j === i);
      });
      if (f) bs[i]?.focus();
      if (tl!.scrollWidth > tl!.clientWidth + 2) {
        const a = bs[i].getBoundingClientRect();
        const c = tl!.getBoundingClientRect();
        tl!.scrollBy({
          left: a.left - c.left - (c.width - a.width) / 2,
          behavior: "smooth",
        });
      }
    }

    function play() {
      if (reduce || t || matchMedia("(max-width:860px)").matches) return;
      t = setInterval(() => {
        if (!hold) set((k + 1) % bs.length);
      }, 6500);
      r!.classList.add("auto");
    }

    function stop() {
      if (t) clearInterval(t);
      t = null;
      r!.classList.remove("auto");
    }

    const onTabClick: Array<{ el: HTMLElement; fn: () => void }> = [];
    bs.forEach((b, i) => {
      const fn = () => {
        set(i);
        stop();
        play();
      };
      b.addEventListener("click", fn);
      onTabClick.push({ el: b, fn });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        set((k + 1) % bs.length, true);
        stop();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        set((k + bs.length - 1) % bs.length, true);
        stop();
      }
    };
    tl.addEventListener("keydown", onKey);

    let x0: number | null = null;
    let y0: number | null = null;
    const pn = r.querySelector(".ct-pns") as HTMLElement | null;
    const onTouchStart = (e: TouchEvent) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - (y0 ?? 0);
      x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        set((k + (dx < 0 ? 1 : bs.length - 1)) % bs.length);
        stop();
      }
    };
    pn?.addEventListener("touchstart", onTouchStart, { passive: true });
    pn?.addEventListener("touchend", onTouchEnd, { passive: true });

    const bx = r.querySelector(".ct-box");
    const onEnter = () => {
      hold = true;
      r!.classList.add("hold");
    };
    const onLeave = () => {
      hold = false;
      r!.classList.remove("hold");
    };
    bx?.addEventListener("mouseenter", onEnter);
    bx?.addEventListener("mouseleave", onLeave);

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            e.isIntersecting ? play() : stop();
          });
        },
        { threshold: 0.3 }
      );
      io.observe(r);
    } else {
      play();
    }

    return () => {
      stop();
      onTabClick.forEach(({ el, fn }) => el.removeEventListener("click", fn));
      tl.removeEventListener("keydown", onKey);
      pn?.removeEventListener("touchstart", onTouchStart);
      pn?.removeEventListener("touchend", onTouchEnd);
      bx?.removeEventListener("mouseenter", onEnter);
      bx?.removeEventListener("mouseleave", onLeave);
      io?.disconnect();
    };
  }, []);

  return null;
}
