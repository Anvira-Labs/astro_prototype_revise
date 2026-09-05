// Zodiac Bee — "Aurora Bloom" presentation-layer effects: scroll-reveal,
// magnetic CTA hover, and the route-transition replay helper. Kept in its
// own module (imported the same way scripts/views/*.js are) so app.js and
// the individual views stay focused on wiring behavior, not motion.
//
// Every effect here is opt-in and additive: nothing in this file mutates
// app state, blocks a click, or changes what a button/link does — it only
// adds a class or a CSS custom property that the stylesheet reacts to. If
// this module failed to load entirely, every screen would still work, just
// without the polish.

const reducedMotionQuery = typeof window !== "undefined" && window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;

function prefersReducedMotion() {
  return !!(reducedMotionQuery && reducedMotionQuery.matches);
}

// ---- Scroll-reveal (IntersectionObserver) ---------------------------------
// Fades/slides in any element carrying [data-reveal] the first time it
// enters the viewport, then stops watching it — a card that's already been
// revealed never needs another callback. Call once per view render and keep
// the returned cleanup around (return it from the view's render function, or
// combine it with another cleanup — see wallet.js/subscription.js for the
// pattern) so the observer doesn't outlive the screen that created it.
export function initScrollReveal(root) {
  const scope = root || document;
  const items = Array.from(scope.querySelectorAll("[data-reveal]"));
  if (!items.length) return () => {};

  // No observer support, or the user asked for reduced motion: skip the
  // choreography and just show everything immediately rather than risk
  // content that never appears.
  if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
    items.forEach((el) => el.classList.add("is-revealed"));
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target); // one-shot — no reason to keep watching it
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

// ---- Magnetic hover on primary CTAs ----------------------------------------
// A subtle pointer-following nudge on .btn-primary, desktop-pointer only.
// Delegated at the document level (rather than re-wired per view/per
// render) so it keeps working across every screen — including ones that
// re-render their own buttons on every store update — without any view
// needing to import or call anything. Call this once, at boot, from app.js.
const MAGNET_SELECTOR = ".btn-primary";
const MAGNET_PULL = 0.22; // fraction of the pointer's offset from center that the button follows
const MAGNET_MAX = 7; // px — keeps the nudge subtle even for a large button under a fast pointer

export function initMagneticCTAs() {
  if (typeof document === "undefined") return;
  const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  // Reduced motion or a touch-first device: a pointer-follow nudge is a
  // "real" continuous animation, and there's no hover concept on touch
  // anyway, so this is a graceful no-op rather than a diminished version.
  if (prefersReducedMotion() || coarsePointer) return;

  let activeBtn = null;
  let raf = null;

  function reset(btn) {
    btn.style.setProperty("--magnet-x", "0px");
    btn.style.setProperty("--magnet-y", "0px");
  }

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const btn = e.target.closest(MAGNET_SELECTOR);

    if (btn !== activeBtn) {
      if (activeBtn) reset(activeBtn);
      activeBtn = btn;
    }
    if (!btn) return;

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const clamp = (n) => Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, n));
      btn.style.setProperty("--magnet-x", clamp(relX * MAGNET_PULL) + "px");
      btn.style.setProperty("--magnet-y", clamp(relY * MAGNET_PULL) + "px");
    });
  });

  // Covers the pointer leaving the window/document entirely while still
  // "over" a button (pointerleave on the button itself is already handled
  // by the btn !== activeBtn check above, since e.target.closest() then
  // resolves against whatever the pointer moved onto instead).
  document.addEventListener("pointerout", (e) => {
    if (e.relatedTarget) return;
    if (activeBtn) reset(activeBtn);
    activeBtn = null;
  });
}

// ---- Route-transition replay ----------------------------------------------
// A tasteful fade + slight slide between views. The CSS animation itself
// lives in app.css (.view-transition / @keyframes route-fade-in); this just
// re-triggers it reliably on an element that may already carry the class
// from a previous render (removing then forcing a reflow before re-adding
// is what makes the *same* class addition replay the animation instead of
// being a no-op). Called from app.js on every route mount.
export function replayViewTransition(el) {
  if (!el) return;
  el.classList.remove("view-transition");
  void el.offsetWidth; // force a reflow so the browser sees a fresh animation start
  el.classList.add("view-transition");
}
