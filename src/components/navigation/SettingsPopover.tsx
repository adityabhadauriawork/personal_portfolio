import React, { useEffect, useRef } from 'react';
import { X, Sliders, Volume2, Sparkles, Eye, Sun, Moon } from 'lucide-react';
import { useExperience, type VisualQuality, type ThemeMode } from '../../context/ExperienceContext';
import styles from './SettingsPopover.module.css';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    setTheme,
    isSoundActive,
    toggleSound,
    visualQuality,
    setVisualQuality,
    effectiveQuality,
    reducedMotion,
    setReducedMotion,
  } = useExperience();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.popoverBackdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Experience & Accessibility Settings"
    >
      <div className={styles.panel} ref={panelRef}>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="var(--color-purple-electric)" />
            <h2 className={styles.title}>Experience Settings</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close settings"
            data-cursor="pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Appearance / Theme Selection */}
        <div className={styles.settingSection}>
          <div className={styles.settingLabel}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {theme === 'dark' ? (
                <Moon size={14} color="var(--color-purple-deep)" />
              ) : (
                <Sun size={14} color="var(--color-purple-deep)" />
              )}
              <span>Appearance Theme</span>
            </span>
            <span className={styles.settingValue}>
              {theme === 'dark' ? 'Dark (Midnight)' : 'Light (Twilight)'}
            </span>
          </div>
          <div className={styles.segmentedGroup}>
            {(['light', 'dark'] as ThemeMode[]).map((t) => (
              <button
                key={t}
                className={`${styles.segmentedOption} ${theme === t ? styles.active : ''}`}
                onClick={() => setTheme(t)}
                data-cursor="pointer"
                aria-pressed={theme === t}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <span className={styles.caption}>
            {theme === 'dark'
              ? 'Deep midnight plum and luminous orchid atmosphere.'
              : 'Luminous pearl-lavender twilight daylight atmosphere.'}
          </span>
        </div>

        {/* Ambient Sound Option */}
        <div className={styles.switchRow}>
          <div className={styles.switchInfo}>
            <span className={styles.switchTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Volume2 size={15} color="var(--color-purple-deep)" /> Ambient Audio
            </span>
            <span className={styles.switchSubtitle}>Procedural generative soundscape</span>
          </div>
          <button
            className={`${styles.switchButton} ${isSoundActive ? styles.active : ''}`}
            onClick={toggleSound}
            role="switch"
            aria-checked={isSoundActive}
            data-cursor="pointer"
          >
            <span className={styles.switchThumb} />
          </button>
        </div>

        {/* Visual Quality Options */}
        <div className={styles.settingSection}>
          <div className={styles.settingLabel}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="var(--color-purple-deep)" /> Visual Quality
            </span>
            <span className={styles.settingValue}>
              {visualQuality === 'auto' ? `Auto (${effectiveQuality})` : visualQuality}
            </span>
          </div>
          <div className={styles.segmentedGroup}>
            {(['auto', 'high', 'reduced'] as VisualQuality[]).map((q) => (
              <button
                key={q}
                className={`${styles.segmentedOption} ${visualQuality === q ? styles.active : ''}`}
                onClick={() => setVisualQuality(q)}
                data-cursor="pointer"
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
          <span className={styles.caption}>
            {visualQuality === 'auto'
              ? 'Dynamically balances particle density & device pixel ratio.'
              : visualQuality === 'high'
              ? '14,000 luminous particles with full reflections & bloom.'
              : '4,500 particles with optimized power consumption.'}
          </span>
        </div>

        {/* Reduced Motion Option */}
        <div className={styles.switchRow}>
          <div className={styles.switchInfo}>
            <span className={styles.switchTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={15} color="var(--color-purple-deep)" /> Reduced Motion
            </span>
            <span className={styles.switchSubtitle}>Dampens camera parallax & particle velocity</span>
          </div>
          <button
            className={`${styles.switchButton} ${reducedMotion ? styles.active : ''}`}
            onClick={() => setReducedMotion(!reducedMotion)}
            role="switch"
            aria-checked={reducedMotion}
            data-cursor="pointer"
          >
            <span className={styles.switchThumb} />
          </button>
        </div>
      </div>
    </div>
  );
};
