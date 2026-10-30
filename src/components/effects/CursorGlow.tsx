import React, { useEffect, useRef } from 'react';
import { pointerState } from '../../utils/pointerState';
import { useExperience } from '../../context/ExperienceContext';
import { FluidSim, type FluidOptions } from './fluidSim';
import styles from './CursorGlow.module.css';

interface PooledSparkle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  isStar: boolean;
  rotation: number;
  rotSpeed: number;
  baseAlpha: number;
}

const MAX_SPARKLES = 24;

/**
 * Refined Cinematic Cursor Simulation:
 * 1. Ordinary system cursor is kept fully visible and unmodified.
 * 2. Full-screen WebGL2 GPU fluid simulation (semi-Lagrangian advection, vorticity confinement,
 *    pressure correction, controlled dissipation) covering the entire viewport.
 * 3. Fluid responds directly to pointer position and velocity with restrained elegance.
 * 4. Refined Cinematic Star Sparkle Trail:
 *    - Delicate lavender-white and pearl-pink star glints.
 *    - Pre-allocated particle pool (zero GC allocation during motion).
 *    - Refresh-rate independent damping across 60Hz, 75Hz, 120Hz, and 144Hz displays.
 *    - Direct DOM visibility toggling (zero React re-renders during mouse movement).
 *    - Respects reduced-motion preference and disables on touch devices.
 */
export const CursorGlow: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fluidCanvasRef = useRef<HTMLCanvasElement>(null);
  const sparkleCanvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = useExperience();
  const reducedMotionRef = useRef(reducedMotion);
  const fluidRef = useRef<FluidSim | null>(null);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    if (fluidRef.current) {
      fluidRef.current.setCurl(reducedMotion ? 2 : 8);
    }
  }, [reducedMotion]);

  const isVisibleRef = useRef(false);
  const sparklesPoolRef = useRef<PooledSparkle[]>(
    Array.from({ length: MAX_SPARKLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 1,
      life: 0,
      maxLife: 1,
      color: '#FFFFFF',
      isStar: false,
      rotation: 0,
      rotSpeed: 0,
      baseAlpha: 1,
    }))
  );

  const lastPos = useRef({ x: -999, y: -999, u: 0.5, v: 0.5, time: 0 });
  const distAccumulatorRef = useRef(0);
  const colorIndexRef = useRef(0);
  const reqIdRef = useRef<number | null>(null);
  const idleFramesRef = useRef(0);

  useEffect(() => {
    // Disable on touch devices
    const isTouch = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    if (isTouch) return;

    const fluidCanvas = fluidCanvasRef.current;
    const sparkleCanvas = sparkleCanvasRef.current;
    const rootEl = rootRef.current;
    if (!fluidCanvas || !sparkleCanvas) return;

    const sparkleCtx = sparkleCanvas.getContext('2d', { alpha: true });

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    const fluidOpts: FluidOptions = {
      simResolution: 128,      // Crisp, performant simulation grid
      dyeResolution: 512,      // Smooth, high-fidelity dye advection
      pressureIterations: 12,  // Fast, accurate pressure projection
      curl: reducedMotionRef.current ? 2 : 8, // Subtle, restrained natural vorticity
      pressure: 0.8,
      velocityDissipation: 0.94, // Dissipates quickly without lingering
      densityDissipation: 0.90,  // Dissipates quickly (no opaque smudges)
      splatRadius: 0.055,      // Compact, localized optical wisp
      splatForce: 1080,        // Restrained amplitude
      maxAlpha: 0.026,         // Translucent ethereal whisper, never obscures text
      pixelRatio,
    };

    const fluid = FluidSim.create(fluidCanvas, fluidOpts);
    fluidRef.current = fluid;

    // Handle WebGL context loss/restore on the fluid canvas
    let fluidContextLost = false;
    const handleFluidContextLost = (e: Event) => {
      e.preventDefault();
      fluidContextLost = true;
    };
    const handleFluidContextRestored = () => {
      if (fluid && fluid.restore()) {
        fluidContextLost = false;
      }
    };
    fluidCanvas.addEventListener('webglcontextlost', handleFluidContextLost);
    fluidCanvas.addEventListener('webglcontextrestored', handleFluidContextRestored);
    sparkleCanvas.addEventListener('webglcontextlost', handleFluidContextLost);
    sparkleCanvas.addEventListener('webglcontextrestored', handleFluidContextRestored);

    const handleResize = () => {
      sparkleCanvas.width = window.innerWidth;
      sparkleCanvas.height = window.innerHeight;
      if (fluid) {
        fluid.resize();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const setVisible = (visible: boolean) => {
      if (isVisibleRef.current !== visible) {
        isVisibleRef.current = visible;
        if (rootEl) {
          if (visible) {
            rootEl.classList.remove(styles.hidden);
          } else {
            rootEl.classList.add(styles.hidden);
          }
        }
      }
    };

    const handlePointerEnter = () => setVisible(true);
    const handlePointerLeave = () => {
      setVisible(false);
      // Deactivate all sparkles in pool
      for (const spk of sparklesPoolRef.current) {
        spk.active = false;
      }
      distAccumulatorRef.current = 0;
    };

    document.addEventListener('mouseenter', handlePointerEnter);
    document.addEventListener('mouseleave', handlePointerLeave);

    // Restrained, ethereal twilight air palette for fluid simulation
    const fluidPalette: [number, number, number][] = [
      [0.38, 0.30, 0.50], // Soft translucent lavender
      [0.48, 0.44, 0.55], // Delicate pearl highlight
      [0.34, 0.24, 0.45], // Subtle twilight violet
      [0.42, 0.32, 0.48], // Restrained orchid wisp
    ];

    // Refined sparkle palette: soft white, delicate lavender, pale orchid, and soft blush pink
    const sparkleColors = [
      '#FFFFFF', // Pure luminous white
      '#FDF4FF', // Soft pearl white
      '#F5D0FE', // Pale orchid highlight
      '#E9D5FF', // Delicate lavender
      '#DDD6FE', // Ethereal twilight mist
      '#FCE7F3', // Soft blush pink highlight
      '#C084FC', // Luminous lavender core
    ];

    let lastTimestamp = performance.now();

    // Helper: Draw 4-point micro-glint diamond star
    const drawStarGlint = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      rotation: number
    ) => {
      const arms = 4;
      const rOuter = size * 2.1;
      const rInner = size * 0.38;
      ctx.beginPath();
      for (let i = 0; i < arms * 2; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const angle = rotation + (i * Math.PI) / arms;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };

    // Helper: spawn pooled sparkle
    const spawnSparkle = (
      originX: number,
      originY: number,
      dxPx: number,
      dyPx: number,
      isStar: boolean,
      size: number,
      driftSpeed: number,
      angle: number
    ) => {
      const pool = sparklesPoolRef.current;
      // Find an inactive slot, or the one with highest progress
      let targetIndex = -1;
      let maxProgress = -1;
      for (let i = 0; i < MAX_SPARKLES; i++) {
        if (!pool[i].active) {
          targetIndex = i;
          break;
        }
        const prog = pool[i].life / pool[i].maxLife;
        if (prog > maxProgress) {
          maxProgress = prog;
          targetIndex = i;
        }
      }

      if (targetIndex >= 0) {
        const spk = pool[targetIndex];
        spk.active = true;
        spk.x = originX + (Math.random() - 0.5) * 8;
        spk.y = originY + (Math.random() - 0.5) * 8;
        spk.vx = Math.cos(angle) * driftSpeed + dxPx * 0.06;
        spk.vy = Math.sin(angle) * driftSpeed + dyPx * 0.06;
        spk.size = size;
        spk.life = 0;
        spk.maxLife = 0.45 + Math.random() * 0.35;
        spk.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        spk.isStar = isStar;
        spk.rotation = Math.random() * Math.PI;
        spk.rotSpeed = (Math.random() - 0.5) * 2.5;
        spk.baseAlpha = 0.88 + Math.random() * 0.12;
      }
    };

    // Frame-synchronized animation loop
    const renderLoop = (timestamp: number) => {
      reqIdRef.current = requestAnimationFrame(renderLoop);

      if (document.hidden || fluidContextLost) return;

      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const targetX = pointerState.x;
      const targetY = pointerState.y;

      const isInside = pointerState.inside && targetX >= 0 && targetY >= 0 && targetX <= width && targetY <= height;

      if (isInside && !isVisibleRef.current) {
        setVisible(true);
      }

      // Normalized coordinates
      const u = targetX / width;
      const v = 1.0 - targetY / height;

      let hasMoved = false;

      if (isInside && lastPos.current.x !== -999) {
        const dxPx = targetX - lastPos.current.x;
        const dyPx = targetY - lastPos.current.y;
        const speedPx = Math.hypot(dxPx, dyPx);

        if (speedPx > 0.4) {
          hasMoved = true;
          idleFramesRef.current = 0;

          const du = u - lastPos.current.u;
          const dv = v - lastPos.current.v;

          // Multi-step interpolation for continuous fluid ribbons
          const steps = Math.min(Math.max(Math.ceil(speedPx / 14), 1), 5);
          for (let s = 1; s <= steps; s++) {
            const frac = s / steps;
            const interpU = lastPos.current.u + du * frac;
            const interpV = lastPos.current.v + dv * frac;

            const speedFactor = Math.min(speedPx / 35, 1.0) * 0.32;
            const radiusScale = 0.65 + Math.min(speedPx / 45, 0.8) * 0.25;

            // Color progression
            colorIndexRef.current = (colorIndexRef.current + 0.08) % fluidPalette.length;
            const baseColor = fluidPalette[Math.floor(colorIndexRef.current)];

            const whiteHighlight = Math.min(speedPx / 45, 0.65);
            const blendedColor: [number, number, number] = [
              baseColor[0] * (1 - whiteHighlight) + 1.0 * whiteHighlight,
              baseColor[1] * (1 - whiteHighlight) + 0.96 * whiteHighlight,
              baseColor[2] * (1 - whiteHighlight) + 1.0 * whiteHighlight,
            ];

            if (fluid && !reducedMotionRef.current) {
              fluid.splat(interpU, interpV, du * speedFactor, dv * speedFactor, blendedColor, radiusScale);
            }
          }

          // Refined Sparkle Emission (zero GC allocation):
          if (!reducedMotionRef.current) {
            distAccumulatorRef.current += speedPx;
            const emitThreshold = speedPx > 8.0 ? 12 : 16;

            if (distAccumulatorRef.current >= emitThreshold) {
              distAccumulatorRef.current = 0;
              const countToEmit = speedPx > 11.0 ? 2 : 1;

              for (let i = 0; i < countToEmit; i++) {
                const angle = Math.random() * Math.PI * 2;
                const driftSpeed = 8 + Math.random() * 22;
                const isStar = Math.random() < 0.45;
                const size = isStar ? 1.1 + Math.random() * 1.1 : 0.8 + Math.random() * 1.0;

                spawnSparkle(targetX, targetY, dxPx, dyPx, isStar, size, driftSpeed, angle);
              }
            }
          }
        }
      }

      if (isInside) {
        lastPos.current = { x: targetX, y: targetY, u, v, time: timestamp };
      } else {
        lastPos.current.x = -999;
        distAccumulatorRef.current = 0;
      }

      // Step & render GPU fluid simulation
      if (fluid && !reducedMotionRef.current) {
        if (hasMoved || idleFramesRef.current < 180) {
          fluid.step(dt);
          fluid.render();
          if (!hasMoved) idleFramesRef.current++;
        } else if (idleFramesRef.current === 180) {
          fluid.clearScreen();
          idleFramesRef.current++;
        }
      }

      // Render refined star sparkles on 2D overlay with frame-rate independent physics
      const pool = sparklesPoolRef.current;
      let hasActiveSparkles = false;
      for (let i = 0; i < MAX_SPARKLES; i++) {
        if (pool[i].active) {
          hasActiveSparkles = true;
          break;
        }
      }

      if (sparkleCtx && (hasActiveSparkles || idleFramesRef.current < 2)) {
        sparkleCtx.clearRect(0, 0, width, height);

        if (!reducedMotionRef.current && hasActiveSparkles) {
          sparkleCtx.save();
          sparkleCtx.globalCompositeOperation = 'lighter';

          // Frame-rate independent exponential damping for velocity
          const drag = Math.pow(0.92, dt * 60);

          for (let s = 0; s < MAX_SPARKLES; s++) {
            const spk = pool[s];
            if (!spk.active) continue;

            spk.life += dt;
            if (spk.life >= spk.maxLife) {
              spk.active = false;
              continue;
            }

            spk.x += spk.vx * dt;
            spk.y += spk.vy * dt;
            spk.vx *= drag;
            spk.vy *= drag;
            spk.vy += 4.5 * dt; // gentle gravitational float
            spk.rotation += spk.rotSpeed * dt;

            const normLife = spk.life / spk.maxLife;
            // Smooth sine fade: ramps up gracefully, gently fades out
            const alpha = Math.sin(normLife * Math.PI) * spk.baseAlpha;
            const currentSize = spk.size * (1.0 - normLife * 0.35);

            sparkleCtx.fillStyle = spk.color;
            sparkleCtx.globalAlpha = Math.max(alpha, 0);

            if (spk.isStar) {
              drawStarGlint(sparkleCtx, spk.x, spk.y, currentSize, spk.rotation);
              sparkleCtx.beginPath();
              sparkleCtx.arc(spk.x, spk.y, currentSize * 0.6, 0, Math.PI * 2);
              sparkleCtx.fill();
            } else {
              sparkleCtx.beginPath();
              sparkleCtx.arc(spk.x, spk.y, currentSize, 0, Math.PI * 2);
              sparkleCtx.fill();
            }
          }

          sparkleCtx.restore();
        }
      }
    };

    reqIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseenter', handlePointerEnter);
      document.removeEventListener('mouseleave', handlePointerLeave);
      fluidCanvas.removeEventListener('webglcontextlost', handleFluidContextLost);
      fluidCanvas.removeEventListener('webglcontextrestored', handleFluidContextRestored);
      sparkleCanvas.removeEventListener('webglcontextlost', handleFluidContextLost);
      sparkleCanvas.removeEventListener('webglcontextrestored', handleFluidContextRestored);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (fluid) fluid.dispose();
      fluidRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${styles.cursorRoot} ${styles.hidden}`}
      aria-hidden="true"
    >
      {/* 1. Full-screen WebGL2 GPU Fluid Simulation */}
      <canvas ref={fluidCanvasRef} className={styles.cursorCanvas} />

      {/* 2. Crystalline Sparkle Motes Overlay */}
      <canvas ref={sparkleCanvasRef} className={styles.cursorCanvas} />
    </div>
  );
};
