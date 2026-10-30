import React, { useEffect, useRef } from 'react';
import { Music, VolumeX, Sparkles } from 'lucide-react';
import { useExperience } from '../../context/ExperienceContext';
import styles from './WelcomeMusicModal.module.css';

export const WelcomeMusicModal: React.FC = () => {
  const { isWelcomeModalOpen, dismissWelcomeModal, theme } = useExperience();
  const modalRef = useRef<HTMLDivElement>(null);
  const musicButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Capture previous focus and trap focus inside modal
  useEffect(() => {
    if (isWelcomeModalOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus primary action after small mount delay
      const timer = window.setTimeout(() => {
        musicButtonRef.current?.focus();
      }, 80);
      return () => window.clearTimeout(timer);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isWelcomeModalOpen]);

  // Handle Escape key (continues silently)
  useEffect(() => {
    if (!isWelcomeModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissWelcomeModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWelcomeModalOpen, dismissWelcomeModal]);

  if (!isWelcomeModalOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${theme === 'dark' ? styles.dark : styles.light}`}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        aria-describedby="welcome-modal-description"
        className={styles.modalCard}
      >
        {/* Ambient Top Decorative Aura */}
        <div className={styles.ambientGlow} aria-hidden="true" />

        {/* Small Branded Header Tag */}
        <div className={styles.tagLine}>
          <Sparkles size={13} className={styles.tagIcon} />
          <span>A warm welcome to Aditya's portfolio</span>
        </div>

        {/* Headline */}
        <h2 id="welcome-modal-title" className={styles.headline}>
          A little music, or just the moment?
        </h2>

        {/* Narrative Subtitle */}
        <p id="welcome-modal-description" className={styles.subtext}>
          Every journey has its own rhythm. How would you like to explore mine?
        </p>

        {/* Two Balanced Choices */}
        <div className={styles.actionsGroup}>
          <button
            ref={musicButtonRef}
            className={styles.musicButton}
            onClick={() => dismissWelcomeModal(true)}
            data-cursor="pointer"
            aria-label="Explore with music"
          >
            <div className={styles.buttonIcon}>
              <Music size={16} />
            </div>
            <span className={styles.buttonLabel}>Explore with music</span>
          </button>

          <button
            className={styles.silenceButton}
            onClick={() => dismissWelcomeModal(false)}
            data-cursor="pointer"
            aria-label="Explore in silence"
          >
            <div className={styles.buttonIconSecondary}>
              <VolumeX size={15} />
            </div>
            <span className={styles.buttonLabel}>Explore in silence</span>
          </button>
        </div>

        {/* Subtle Footnote */}
        <p className={styles.footnote}>
          You can toggle sound or switch themes at any time from the navigation bar.
        </p>
      </div>
    </div>
  );
};

