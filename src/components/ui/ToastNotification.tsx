import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useExperience } from '../../context/ExperienceContext';
import styles from './ToastNotification.module.css';

export const ToastNotification: React.FC = () => {
  const { activeNotification, hideNotification } = useExperience();

  useEffect(() => {
    if (!activeNotification) return;

    const timer = setTimeout(() => {
      hideNotification();
    }, 4500);

    return () => clearTimeout(timer);
  }, [activeNotification, hideNotification]);

  if (!activeNotification) return null;

  return (
    <div
      className={`${styles.toastContainer} ${activeNotification ? styles.visible : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.toastPill}>
        <span className={styles.sparkleDot}>
          <Sparkles size={15} />
        </span>
        <span>{activeNotification}</span>
        <button
          className={styles.closeButton}
          onClick={hideNotification}
          aria-label="Dismiss notification"
          data-cursor="pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
