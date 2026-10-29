import React, { useState } from 'react';
import styles from './BotanicalWindow.module.css';

interface BotanicalWindowProps {
  assetPath?: string;
  className?: string;
}

/**
 * BotanicalWindow Component
 * Architectural botanical display tailored to the 16:9 widescreen animated flora GIF.
 * Features a refined luminous frame and the curated quote: "Bloom at your own pace."
 * Excludes any technical labels, filenames, or implementation metadata.
 */
export const BotanicalWindow: React.FC<BotanicalWindowProps> = ({
  assetPath = '/assets/portfolio/flowers/contact-flower.gif',
  className = '',
}) => {
  const [isAssetLoaded, setIsAssetLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const showPlaceholder = !isAssetLoaded || hasError;

  return (
    <div
      className={`${styles.botanicalContainer} ${className}`}
      role="region"
      aria-label="Artistic botanical installation"
    >
      {/* 16:9 Landscape Botanical Frame */}
      <div className={styles.windowFrame}>
        {/* Soft atmospheric radial aura */}
        <div className={styles.ambientAura} aria-hidden="true" />

        {/* Media Stage: Proportioned strictly to 16:9 landscape aspect ratio */}
        <div className={styles.mediaStage}>
          {/* Active Image Element — natively renders the animated GIF */}
          <img
            src={assetPath}
            alt="Art-directed blooming botanical animation"
            className={styles.flowerGif}
            loading="lazy"
            decoding="async"
            style={{ opacity: isAssetLoaded && !hasError ? 1 : 0 }}
            onLoad={() => {
              setIsAssetLoaded(true);
              setHasError(false);
            }}
            onError={() => {
              setHasError(true);
              setIsAssetLoaded(false);
            }}
          />

          {/* Graceful Fallback Botanical SVG Illustration if GIF is loading or fails */}
          {showPlaceholder && (
            <div className={styles.placeholderArt}>
              <svg
                className={styles.botanicalSvg}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="petalGrad1" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F472B6" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#C084FC" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#581C87" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="petalGrad2" x1="20" y1="100" x2="180" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#E879F9" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#9333EA" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3B0764" stopOpacity="0.85" />
                  </linearGradient>

                  <radialGradient id="coreGlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
                    <stop offset="35%" stopColor="#F472B6" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#C084FC" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#9333EA" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <g opacity="0.35" stroke="#7E22CE" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M100 130 Q85 160 70 190" />
                  <path d="M100 130 Q115 160 130 190" />
                  <path d="M100 135 L100 195" strokeWidth="2" stroke="#581C87" />
                </g>

                <g>
                  <path d="M100 100 C80 50 85 24 100 15 C115 24 120 50 100 100Z" fill="url(#petalGrad1)" opacity="0.8" />
                  <path d="M100 100 C80 150 85 176 100 185 C115 176 120 150 100 100Z" fill="url(#petalGrad1)" opacity="0.8" />
                  <path d="M100 100 C50 80 24 85 15 100 C24 115 50 120 100 100Z" fill="url(#petalGrad2)" opacity="0.8" />
                  <path d="M100 100 C150 80 176 85 185 100 C176 115 150 120 100 100Z" fill="url(#petalGrad2)" opacity="0.8" />
                </g>

                <g className={styles.svgCorePulse}>
                  <circle cx="100" cy="100" r="28" fill="url(#coreGlowGrad)" />
                  <circle cx="100" cy="100" r="10" fill="#FDF2F8" />
                  <circle cx="100" cy="100" r="5" fill="#FEF08A" />
                </g>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Elegant Editorial Quote */}
      <div className={styles.quoteWrapper}>
        <blockquote className={styles.quoteBlock}>
          <span className={styles.quoteText}>“Love is a winter flower.”</span>
          <span className={styles.quoteAuthor}>— Oscar Wilde</span>
        </blockquote>
      </div>
    </div>
  );
};
