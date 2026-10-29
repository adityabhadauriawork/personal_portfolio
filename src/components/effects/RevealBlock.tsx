import React, { useEffect, useRef, useState } from 'react';
import { useExperience } from '../../context/ExperienceContext';
import styles from './RevealBlock.module.css';

interface RevealBlockProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  style?: React.CSSProperties;
}

export const RevealBlock: React.FC<RevealBlockProps> = ({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.12,
  style = {},
}) => {
  const { reducedMotion } = useExperience();
  const [isRevealed, setIsRevealed] = useState(reducedMotion);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const element = blockRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
          } else if (entry.boundingClientRect.top > window.innerHeight) {
            // Natural bidirectional reset when scrolled above
            setIsRevealed(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, threshold]);

  return (
    <div
      ref={blockRef}
      className={`${styles.blockWrapper} ${
        isRevealed || reducedMotion ? styles.revealed : ''
      } ${className}`}
      style={{
        ...style,
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
};
