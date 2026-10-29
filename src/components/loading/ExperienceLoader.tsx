import React, { useEffect, useState, useRef } from 'react';
import { useExperience } from '../../context/ExperienceContext';
import styles from './ExperienceLoader.module.css';

interface ExperienceLoaderProps {
  isSceneReady: boolean;
}

const LETTERS = ['A', 'D', 'I', 'T', 'Y', 'A'];

export const ExperienceLoader: React.FC<ExperienceLoaderProps> = ({ isSceneReady }) => {
  const { isLoaded, finishLoading } = useExperience();
  const [lettersVisible, setLettersVisible] = useState<boolean[]>(new Array(LETTERS.length).fill(false));
  const [progress, setProgress] = useState<number>(12);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Preparing your experience');
  const [hasUnmounted, setHasUnmounted] = useState<boolean>(false);
  const progressIntervalRef = useRef<number | null>(null);

  // Staggered letter reveal
  useEffect(() => {
    LETTERS.forEach((_, idx) => {
      setTimeout(() => {
        setLettersVisible((prev) => {
          const next = [...prev];
          next[idx] = true;
          return next;
        });
      }, 180 + idx * 120);
    });
  }, []);

  // Monitor loading lifecycle
  useEffect(() => {
    let current = 12;

    // Phase 1: Wait for fonts
    document.fonts.ready.then(() => {
      current = Math.max(current, 45);
      setProgress(current);
      setStatusMessage('Initializing WebGL environment');
    });

    // Simulated steady progression towards 85%
    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev < 82) {
          return prev + Math.floor(Math.random() * 6) + 2;
        }
        return prev;
      });
    }, 140);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // When scene signals it is ready (or safety fallback)
  useEffect(() => {
    if (isSceneReady) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      setStatusMessage('Harmonizing 3D atmosphere');
      setProgress(100);

      const exitTimeout = window.setTimeout(() => {
        setIsExiting(true);
        const completeTimeout = window.setTimeout(() => {
          finishLoading();
          setHasUnmounted(true);
        }, 1100);
        return () => clearTimeout(completeTimeout);
      }, 550);

      return () => clearTimeout(exitTimeout);
    }
  }, [isSceneReady, finishLoading]);

  // Safety fallback: Never leave the user stuck on an infinite loader
  useEffect(() => {
    const safetyTimeout = window.setTimeout(() => {
      if (!isLoaded) {
        setProgress(100);
        setIsExiting(true);
        setTimeout(() => {
          finishLoading();
          setHasUnmounted(true);
        }, 800);
      }
    }, 4500);

    return () => clearTimeout(safetyTimeout);
  }, [isLoaded, finishLoading]);

  if (hasUnmounted) return null;

  return (
    <div
      className={`${styles.loaderOverlay} ${isExiting ? styles.exiting : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio experience"
    >
      <div className={styles.ambientGlow} />

      <div className={styles.centerContent}>
        <span className={styles.tagline}>
          Software Engineering · AI · Intelligent Systems
        </span>

        <h1 className={styles.wordmark} aria-label="Aditya">
          {LETTERS.map((char, index) => (
            <span key={index} className={styles.letterWrap}>
              <span
                className={`${styles.letter} ${lettersVisible[index] ? styles.visible : ''}`}
              >
                {char}
              </span>
            </span>
          ))}
        </h1>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>

        <div className={styles.statusContainer}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>{statusMessage}</span>
          <span className={styles.percentage}>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className={styles.bottomMeta}>
        <span>ADITYA PRATAP SINGH BHADAURIA</span>
        <span>PSIT KANPUR · CSE '28</span>
      </div>
    </div>
  );
};
