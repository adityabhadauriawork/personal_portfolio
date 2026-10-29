/**
 * High-performance, zero-React-re-render scroll state tracker
 * Decouples window scroll telemetry from React lifecycle.
 * Polled directly inside Three.js RAF loops and RAF listeners.
 *
 * Scroll events can fire several times per frame; measurements (which force layout)
 * are coalesced into at most ONE read per animation frame. Document height is cached
 * and refreshed on resize / DOM size changes instead of on every scroll event.
 */

export interface ScrollState {
  scrollY: number;
  progress: number;
  heroProgress: number;
  transitionProgress: number;
  maxScroll: number;
  viewportHeight: number;
}

export const scrollState: ScrollState = {
  scrollY: 0,
  progress: 0,
  heroProgress: 0,
  transitionProgress: 0,
  maxScroll: 1,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 900,
};

if (typeof window !== 'undefined') {
  let docHeight = 0;
  let pending = false;

  const measureDoc = () => {
    docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  };

  const updateScroll = () => {
    pending = false;
    if (!docHeight) measureDoc();
    const winHeight = window.innerHeight;
    const maxScroll = Math.max(docHeight - winHeight, 1);

    scrollState.scrollY = window.scrollY;
    scrollState.maxScroll = maxScroll;
    scrollState.viewportHeight = winHeight;
    scrollState.progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

    // Pinned Home track = [cinematic beats][dedicated transition zone]. The zone marker is an
    // absolutely-positioned element occupying the last stretch of the track.
    const zoneEl = document.getElementById('home-transition-zone');
    const zoneH = zoneEl ? zoneEl.offsetHeight : 0;
    const heroEl = document.getElementById('hero-pinned-track');
    if (heroEl) {
      const rect = heroEl.getBoundingClientRect();
      const beatsScrollable = heroEl.offsetHeight - winHeight - zoneH;
      scrollState.heroProgress =
        beatsScrollable > 0 ? Math.min(Math.max(-rect.top / beatsScrollable, 0), 1) : 0;
    } else {
      scrollState.heroProgress = scrollState.progress;
    }

    if (zoneEl && zoneH > 0) {
      const zr = zoneEl.getBoundingClientRect();
      // 0 when the zone's top enters the viewport bottom, 1 when the pinned scene is released
      scrollState.transitionProgress = Math.min(Math.max((winHeight - zr.top) / zoneH, 0), 1);
    } else {
      scrollState.transitionProgress = 0;
    }
  };

  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateScroll);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      measureDoc();
      schedule();
    },
    { passive: true }
  );

  // Route changes / content loading change the document height without a resize event.
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      measureDoc();
      schedule();
    });
    const attach = () => ro.observe(document.body);
    if (document.body) attach();
    else window.addEventListener('DOMContentLoaded', attach, { once: true });
  }

  setTimeout(() => {
    measureDoc();
    updateScroll();
  }, 50);
}
