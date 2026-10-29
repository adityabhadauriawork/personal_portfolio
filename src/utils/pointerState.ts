/**
 * Global zero-overhead pointer coordinates tracker.
 * Updates in-place without triggering React re-renders. This is the ONE pointer source
 * shared by the full-screen fluid overlay and the Three.js scene (sculpture flow field,
 * camera parallax). Consumers read it inside their own rAF loops and compute per-frame deltas.
 */

export interface PointerCoordinates {
  x: number; // CSS px, viewport space
  y: number;
  normalizedX: number; // -1 to 1 (NDC)
  normalizedY: number; // -1 to 1 (NDC, +y up)
  inside: boolean; // pointer currently over the document
  lastMoveTime: number; // performance.now() of the last move
  moveCount: number; // increments on every move (cheap "has it moved since last frame" check)
}

export const pointerState: PointerCoordinates = {
  x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  normalizedX: 0,
  normalizedY: 0,
  inside: false,
  lastMoveTime: 0,
  moveCount: 0,
};

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e: PointerEvent) => {
      pointerState.x = e.clientX;
      pointerState.y = e.clientY;
      pointerState.normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerState.normalizedY = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerState.inside = true;
      pointerState.lastMoveTime = performance.now();
      pointerState.moveCount++;
    },
    { passive: true }
  );
  document.addEventListener('pointerleave', () => {
    pointerState.inside = false;
  });
  // Mark as inside immediately when cursor re-enters the page (before the first
  // 'pointermove' fires). Without this there is a brief window after re-entry
  // where 'inside' is still false and the scene reads stale coordinates.
  document.addEventListener('pointerenter', (e: PointerEvent) => {
    pointerState.x = e.clientX;
    pointerState.y = e.clientY;
    pointerState.normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerState.normalizedY = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerState.inside = true;
    pointerState.lastMoveTime = performance.now();
  });
  window.addEventListener('blur', () => {
    pointerState.inside = false;
  });
}
