import React from 'react';
import styles from './PortalTransition.module.css';

export type PortalPhase = 'idle' | 'closing' | 'opening';

/**
 * Full-viewport circular iris. Owned by App so it survives the route swap:
 *  closing: a luminous disc grows out of the ring until the outgoing scene is concealed
 *  opening: the swap has happened underneath; a circular hole grows to reveal the destination
 * Reduced motion degrades to a short crossfade.
 */
export const PortalTransition: React.FC<{ phase: PortalPhase }> = ({ phase }) => (
  <div className={`${styles.root} ${styles[phase]}`} aria-hidden="true">
    <div className={styles.disc} />
    <div className={styles.reveal} />
    <div className={styles.fade} />
  </div>
);
