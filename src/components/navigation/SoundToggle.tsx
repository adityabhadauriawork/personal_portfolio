import React from 'react';
import { useExperience } from '../../context/ExperienceContext';
import { useAmbientAudio } from '../../hooks/useAmbientAudio';
import styles from './SoundToggle.module.css';

interface SoundToggleProps {
  isDarkTheme?: boolean;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ isDarkTheme = false }) => {
  const { isSoundActive, toggleSound } = useExperience();
  const { playInteractionChime } = useAmbientAudio();

  const handleClick = () => {
    toggleSound();
    if (!isSoundActive) {
      // User is enabling sound, play chime feedback
      setTimeout(() => playInteractionChime(1046.5), 150);
    }
  };

  return (
    <button
      className={`${styles.soundButton} ${isDarkTheme ? styles.darkTheme : ''} ${
        isSoundActive ? styles.active : ''
      }`}
      onClick={handleClick}
      aria-label={isSoundActive ? 'Mute ambient sound' : 'Enable ambient sound'}
      aria-pressed={isSoundActive}
      data-cursor="pointer"
    >
      <div className={styles.waveContainer} aria-hidden="true">
        <span className={styles.waveBar} />
        <span className={styles.waveBar} />
        <span className={styles.waveBar} />
        <span className={styles.waveBar} />
      </div>
      <span className={styles.label}>{isSoundActive ? 'Sound On' : 'Sound'}</span>
      <span className={styles.tooltip} role="tooltip">
        {isSoundActive ? 'Mute ambient sound' : 'Enable ambient sound'}
      </span>
    </button>
  );
};
