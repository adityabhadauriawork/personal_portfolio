import React, { useEffect, useRef, useState } from 'react';
import { useExperience } from '../../context/ExperienceContext';
import styles from './RevealText.module.css';

interface RevealTextProps {
  children: React.ReactNode;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  delayMs?: number;
  staggerMs?: number;
  threshold?: number;
}

export const RevealText: React.FC<RevealTextProps> = ({
  children,
  tag = 'h2',
  className = '',
  delayMs = 0,
  threshold = 0.15,
}) => {
  const { reducedMotion } = useExperience();
  const [isRevealed, setIsRevealed] = useState(reducedMotion);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
          } else if (entry.boundingClientRect.top > window.innerHeight) {
            // Natural bidirectional reset only when scrolled completely above viewport
            setIsRevealed(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, threshold]);

  const TagComponent = tag as any;

  return (
    <TagComponent
      ref={containerRef}
      className={`${styles.revealWrapper} ${className}`}
      data-revealed={isRevealed || reducedMotion}
    >
      <span
        className={`${styles.innerContent} ${
          isRevealed || reducedMotion ? styles.revealed : ''
        }`}
        style={{
          transitionDelay: `${delayMs}ms`,
        }}
      >
        {children}
      </span>
    </TagComponent>
  );
};
