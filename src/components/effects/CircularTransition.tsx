import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './CircularTransition.module.css';

interface CircularTransitionProps {
  /** 0..1 — real scroll progress through the dedicated transition zone */
  progress: number;
  onTrigger: () => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Circular scroll-progress ring. The stroke fills with the visitor's real scroll
 * progress through the end-of-Home transition zone; completing it (or pressing the
 * button / Enter / Space) hands over to the portal transition owned by App.
 */
export const CircularTransition: React.FC<CircularTransitionProps> = ({
  progress,
  onTrigger,
  disabled = false,
  label = 'NEXT · ABOUT',
}) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const p = Math.min(Math.max(progress, 0), 1);

  // Only auto-advance after the visitor has actually been scrolling *toward* the end:
  // arming requires seeing the ring below 60%, so returning to Home (back button /
  // scroll restoration) can never instantly bounce the visitor forward again.
  const armed = useRef(false);
  useEffect(() => {
    if (p < 0.6) armed.current = true;
    if (p >= 0.995 && armed.current && !disabled) {
      armed.current = false;
      onTrigger();
    }
  }, [p, disabled, onTrigger]);

  const glow = 0.25 + p * 0.75;

  return (
    <div className={styles.transitionContainer}>
      <button
        type="button"
        className={styles.indicatorWrapper}
        onClick={onTrigger}
        disabled={disabled}
        aria-label={`Continue to About page (${Math.round(p * 100)}% of the way)`}
        data-cursor="pointer"
        style={{ ['--ring-glow' as string]: glow }}
      >
        <svg className={styles.svgRing} viewBox="0 0 110 110" aria-hidden="true">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D8B4FE" />
              <stop offset="55%" stopColor="#8B3DF5" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>
          <circle className={styles.track} cx="55" cy="55" r={radius} />
          <circle
            className={styles.progress}
            cx="55"
            cy="55"
            r={radius}
            stroke="url(#ringGrad)"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - p)}
          />
        </svg>
        <span className={styles.centerText}>
          <span className={styles.percent}>{Math.round(p * 100)}</span>
          <ArrowRight size={14} className={styles.arrow} />
        </span>
      </button>
      <div className={styles.labelGroup}>
        <span className={styles.mainLabel}>{label}</span>
        <span className={styles.subLabel}>Keep scrolling, or press Enter</span>
      </div>
    </div>
  );
};
