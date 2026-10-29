import React, { useEffect, useState } from 'react';
import { useExperience } from '../../context/ExperienceContext';
import { scrollState } from '../../utils/scrollState';
import { CircularTransition } from '../effects/CircularTransition';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  onExploreWork?: () => void;
  onDiscoverStory?: () => void;
  onNavigateToAbout: () => void;
  transitionBusy?: boolean;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Opacity window with fade-in [a, a+f] and fade-out [b-f, b]. Windows never overlap between beats. */
const windowed = (p: number, a: number, b: number, f: number, fadeIn = true, fadeOut = true) =>
  (fadeIn ? smooth(a, a + f, p) : 1) * (fadeOut ? 1 - smooth(b - f, b, p) : 1);

/**
 * Pinned cinematic opening: five beats whose text is choreographed with the camera
 * (see HeroScene), followed by a dedicated transition zone at the end of the same
 * pinned track so the 3D world stays on screen while the progress ring fills.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreWork: _onExploreWork,
  onDiscoverStory: _onDiscoverStory,
  onNavigateToAbout,
  transitionBusy = false,
}) => {
  const { isLoaded } = useExperience();
  const [hp, setHp] = useState(0);
  const [tp, setTp] = useState(0);

  // Reads the shared scroll state; React only re-renders when a quantised value changes.
  useEffect(() => {
    let reqId = 0;
    const poll = () => {
      reqId = requestAnimationFrame(poll);
      if (document.hidden) return;
      const h = Math.round(scrollState.heroProgress * 400) / 400;
      const t = Math.round(scrollState.transitionProgress * 200) / 200;
      setHp((prev) => (prev !== h ? h : prev));
      setTp((prev) => (prev !== t ? t : prev));
    };
    reqId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(reqId);
  }, []);

  const o1 = windowed(hp, 0, 0.19, 0.05, false, true);
  const o2 = windowed(hp, 0.21, 0.4, 0.05);
  const o3 = windowed(hp, 0.42, 0.6, 0.05);
  const o4 = windowed(hp, 0.62, 0.8, 0.05);
  const o5 = smooth(0.82, 0.9, hp);

  const layer = (o: number, lift = 22): React.CSSProperties => ({
    opacity: o,
    visibility: o < 0.01 ? 'hidden' : 'visible',
    transform: `translate3d(0, ${(1 - o) * lift}px, 0)`,
  });

  return (
    <section
      id="hero-pinned-track"
      className={styles.pinnedTrack}
      aria-label="Cinematic opening experience"
    >
      <div className={styles.stickyViewport}>
        {/* BEAT 1 — Editorial Reference Composition */}
        <div className={`${styles.beatContainer} ${styles.beat1}`} style={{ ...layer(o1, -22), pointerEvents: o1 > 0.4 ? 'auto' : 'none' }}>
          <div className={styles.heroGrid}>
            <div className={styles.leftColumn}>
              <div className={styles.captionWrapper}>
                <p className={`${styles.caption} ${isLoaded ? styles.revealed : ''}`}>
                  <span>SOFTWARE ENGINEERING · AI/ML · INTELLIGENT SYSTEMS</span>
                </p>
              </div>

              <div className={styles.leadWordMask}>
                <span
                  className={`${styles.leadWord} ${isLoaded ? styles.revealed : ''}`}
                  style={{ transitionDelay: '200ms' }}
                >
                  Where
                </span>
              </div>
            </div>

            <div className={styles.rightColumn}>
              {['IDEAS BECOME', 'INTELLIGENT', 'EXPERIENCES.'].map((line, i) => (
                <div className={styles.stackMask} key={line}>
                  <span
                    className={`${styles.stackLine} ${isLoaded ? styles.revealed : ''}`}
                    style={{ transitionDelay: `${260 + i * 120}ms` }}
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BEAT 2 — Narrative Chapter 2: Who I am (text left; sculpture frames right) */}
        <div className={`${styles.beatContainer} ${styles.beat2}`} style={layer(o2)}>
          <div className={styles.beatCardLeft}>
            <span className={styles.beatTag}>
              <span className={styles.beatTagDot} />
              02 · Who I am
            </span>
            <h2 className={styles.beatHeadline}>Curiosity becomes capability.</h2>
            <p className={styles.beatBody}>
              “I'm Aditya, a Computer Science undergraduate at PSIT Kanpur, building AI-powered products, dependable software systems, and thoughtful digital experiences.”
            </p>
          </div>
        </div>

        {/* BEAT 3 — Narrative Chapter 3: How I work (centered composition over lake) */}
        <div className={`${styles.beatContainer} ${styles.beat3}`} style={layer(o3)}>
          <div className={styles.beatCardCenter}>
            <span className={styles.beatTag}>
              <span className={styles.beatTagDot} />
              03 · How I work
            </span>
            <h2 className={styles.beatHeadlineLarge}>From models to meaningful products.</h2>
            <p className={styles.beatBodyCenter}>
              “I work across machine learning, data systems, backend engineering, and full-stack development—connecting technical depth with practical problem-solving.”
            </p>
          </div>
        </div>

        {/* BEAT 4 — Narrative Chapter 4: Engineering philosophy (text right; sculpture frames left) */}
        <div className={`${styles.beatContainer} ${styles.beat4}`} style={layer(o4)}>
          <div className={styles.beatCardRight}>
            <span className={styles.beatTag}>
              <span className={styles.beatTagDot} />
              04 · Engineering philosophy
            </span>
            <h2 className={styles.beatHeadline}>Build with intent.</h2>
            <p className={styles.beatBody}>
              “I care about clear architecture, measurable results, responsive interfaces, and systems that remain reliable beyond the demo.”
            </p>
          </div>
        </div>

        {/* BEAT 5 — Narrative Chapter 5: Work preview + dedicated transition zone */}
        <div
          className={`${styles.beatContainer} ${styles.beat5}`}
          style={{ ...layer(o5), pointerEvents: o5 > 0.4 ? 'auto' : 'none' }}
        >
          <div className={styles.beat5Content}>
            <span className={styles.beatTag}>
              <span className={styles.beatTagDot} />
              05 · Work preview
            </span>
            <h2 className={styles.beatHeadlineLarge}>Ideas deserve to work in the real world.</h2>
            <p className={styles.beatBodyCenter}>
              “Explore my projects, experiments, and technical work across AI/ML, software engineering, data, and interactive product development.”
            </p>
            <div className={styles.ringWrapper}>
              <CircularTransition progress={tp} onTrigger={onNavigateToAbout} disabled={transitionBusy} />
            </div>
          </div>
        </div>

        <div
          className={styles.scrollHint}
          style={{ opacity: Math.max(0, 1 - hp * 6), visibility: hp > 0.2 ? 'hidden' : 'visible' }}
        >
          <span className={styles.scrollMouse}>
            <span className={styles.scrollWheel} />
          </span>
          <span className={styles.scrollHintText}>Scroll to explore</span>
        </div>
      </div>

      {/* Dedicated transition zone: the last stretch of the pinned track. Progress is derived from it. */}
      <div id="home-transition-zone" className={styles.transitionZone} aria-hidden="true" />
    </section>
  );
};
