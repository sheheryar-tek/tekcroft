"use client";

import { useEffect } from "react";

/**
 * Wires #app-journey step switching + mobile swipe nav
 * (design-file mj-script + mj-swipe behaviour).
 */
export default function AppJourney() {
  useEffect(() => {
    const r = document.getElementById("app-journey");
    if (!r) return;
    if (r.dataset.mjWired === "1") return;
    r.dataset.mjWired = "1";

    const ac = new AbortController();
    const { signal } = ac;

    const st = Array.from(r.querySelectorAll<HTMLElement>(".mj"));
    const sc = Array.from(r.querySelectorAll<HTMLElement>(".ms"));
    const fl = Array.from(r.querySelectorAll<HTMLElement>(".mf"));
    let k = 0;
    let t: ReturnType<typeof setInterval> | null = null;
    let hold = false;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function set(i: number) {
      k = i;
      r!.setAttribute("data-s", String(i));
      Array.from(r!.querySelectorAll(".sc")).forEach((e, j) => {
        e.classList.toggle("on", j === i);
      });
      [st, sc, fl].forEach((g) => {
        g.forEach((e, j) => {
          e.classList.toggle("on", j === i);
        });
      });
      st.forEach((e, j) => {
        e.classList.toggle("done", j < i);
        e.querySelector(".mj-h")?.setAttribute(
          "aria-pressed",
          j === i ? "true" : "false"
        );
      });
    }

    function play() {
      if (reduce || t) return;
      t = setInterval(() => {
        if (!hold) set((k + 1) % st.length);
      }, 5000);
      r!.classList.add("auto");
    }

    function stop() {
      if (t != null) clearInterval(t);
      t = null;
      r!.classList.remove("auto");
    }

    st.forEach((e, i) => {
      e.addEventListener(
        "click",
        () => {
          set(i);
          stop();
          play();
        },
        { signal }
      );
      let hv: ReturnType<typeof setTimeout> | null = null;
      e.addEventListener(
        "mouseenter",
        () => {
          if (!window.matchMedia("(hover:hover)").matches) return;
          if (hv) clearTimeout(hv);
          hv = setTimeout(() => {
            if (k !== i) set(i);
          }, 220);
        },
        { signal }
      );
      e.addEventListener(
        "mouseleave",
        () => {
          if (hv) clearTimeout(hv);
        },
        { signal }
      );
    });

    const L = r.querySelector<HTMLElement>(".mj-list");
    if (L) {
      L.addEventListener(
        "mouseenter",
        () => {
          hold = true;
          r!.classList.add("hold");
        },
        { signal }
      );
      L.addEventListener(
        "mouseleave",
        () => {
          hold = false;
          r!.classList.remove("hold");
          stop();
          play();
        },
        { signal }
      );
    }

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) play();
            else stop();
          });
        },
        { threshold: 0.3 }
      );
      io.observe(r);
    } else {
      play();
    }

    /* --- mj-swipe: mobile prev/next + swipe --- */
    const stage = r.querySelector<HTMLElement>(".sb-stage");
    let x0: number | null = null;
    let y0: number | null = null;
    let mo: MutationObserver | null = null;

    function cur() {
      for (let i = 0; i < st.length; i++) {
        if (st[i].classList.contains("on")) return i;
      }
      return 0;
    }

    if (L && !L.querySelector(".mj-nav")) {
      const nav = document.createElement("div");
      nav.className = "mj-nav";
      nav.innerHTML =
        '<button type="button" class="mj-pv" aria-label="Previous step">&#8249;</button><span class="mj-ct"><b>1</b> / ' +
        st.length +
        '</span><button type="button" class="mj-nx" aria-label="Next step">&#8250;</button>';
      L.appendChild(nav);
      const ct = nav.querySelector("b");
      nav.querySelector(".mj-pv")?.addEventListener(
        "click",
        () => {
          st[(cur() - 1 + st.length) % st.length].click();
        },
        { signal }
      );
      nav.querySelector(".mj-nx")?.addEventListener(
        "click",
        () => {
          st[(cur() + 1) % st.length].click();
        },
        { signal }
      );
      mo = new MutationObserver(() => {
        const c = cur();
        if (ct) ct.textContent = String(c + 1);
        L.style.setProperty("--p", String(c / (st.length - 1)));
      });
      mo.observe(L, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    if (stage) {
      stage.addEventListener(
        "touchstart",
        (e) => {
          x0 = e.touches[0].clientX;
          y0 = e.touches[0].clientY;
        },
        { passive: true, signal }
      );
      stage.addEventListener(
        "touchend",
        (e) => {
          if (x0 === null || y0 === null) return;
          const dx = e.changedTouches[0].clientX - x0;
          const dy = e.changedTouches[0].clientY - y0;
          x0 = null;
          y0 = null;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            let n = cur() + (dx < 0 ? 1 : -1);
            n = (n + st.length) % st.length;
            st[n].click();
          }
        },
        { passive: true, signal }
      );
    }

    return () => {
      stop();
      ac.abort();
      io?.disconnect();
      mo?.disconnect();
      delete r.dataset.mjWired;
    };
  }, []);

  return null;
}
