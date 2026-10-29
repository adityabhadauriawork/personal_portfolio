import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Sparkles, Eye, ShieldCheck, ArrowUpRight, Code2 } from 'lucide-react';
import { achievementsData, type AchievementItem } from '../../data/achievements';
import { siteConfig } from '../../data/siteConfig';
import { ImageLightboxModal, type LightboxData } from './ImageLightboxModal';
import { RevealText } from '../effects/RevealText';
import styles from './Chapter06_Achievements.module.css';

/** Refined Vector Train Engine moving along central railway */
const TrainEngine: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      className={styles.trainWrapper}
      style={{
        top: `${Math.min(Math.max(progress * 100, 3), 94)}%`,
      }}
      aria-hidden="true"
    >
      <svg className={styles.trainSvg} viewBox="0 0 44 64" fill="none">
        <defs>
          <linearGradient id="trainBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#963BFA" />
            <stop offset="100%" stopColor="#581C87" />
          </linearGradient>
          <filter id="trainShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#581C87" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Train Chassis */}
        <rect x="8" y="10" width="28" height="44" rx="6" fill="url(#trainBodyGrad)" filter="url(#trainShadow)" />
        {/* Cab Roof / Window */}
        <rect x="12" y="16" width="20" height="12" rx="3" fill="#FFFFFF" fillOpacity="0.9" />
        {/* Cowcatcher / Nose */}
        <polygon points="12,54 32,54 22,62" fill="#581C87" />
        {/* Headlight */}
        <circle cx="22" cy="12" r="3" fill="#FDE047" />
        {/* Rail wheels */}
        <rect x="5" y="18" width="3" height="8" rx="1.5" fill="#3B0764" />
        <rect x="36" y="18" width="3" height="8" rx="1.5" fill="#3B0764" />
        <rect x="5" y="38" width="3" height="8" rx="1.5" fill="#3B0764" />
        <rect x="36" y="38" width="3" height="8" rx="1.5" fill="#3B0764" />
      </svg>
      <span className={styles.trainTelemetry}>
        Station · {Math.round(progress * 100)}%
      </span>
    </div>
  );
};

export const Chapter06Achievements: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [trainProgress, setTrainProgress] = useState(0);
  const furthestProgressRef = useRef(0);
  const [lightboxData, setLightboxData] = useState<LightboxData | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Throttled scroll listener to smoothly advance the train when section is near viewport
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const viewportH = window.innerHeight;
        // Only compute if section is in or near the viewport
        if (rect.bottom < -100 || rect.top > viewportH + 100) return;

        const totalH = section.offsetHeight || 1;
        const visibleOffset = viewportH * 0.5 - rect.top;
        const currentProg = Math.min(Math.max(visibleOffset / totalH, 0), 1);

        if (currentProg > furthestProgressRef.current) {
          furthestProgressRef.current = currentProg;
          const quantized = Math.round(currentProg * 100) / 100;
          setTrainProgress((prev) => (Math.abs(prev - quantized) >= 0.01 ? quantized : prev));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInspect = (item: AchievementItem) => {
    setLightboxData({
      title: `${item.title} (${item.prefix || ''}${item.metric}${item.suffix || ''})`,
      subtitle: item.subtitle,
      issuerOrCategory: item.category,
      imagePath: item.evidence.assetPath,
      details: item.description,
      verificationNote: item.evidence.verificationNote,
    });
  };

  return (
    <section
      id="achievements"
      ref={sectionRef}
      className={styles.section}
      aria-label="Achievements and Milestones"
    >
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>ACHIEVEMENTS / 07</span>
            <span className={styles.separator}>·</span>
            <span>THE RAILWAY OF MILESTONES</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            Competitive execution and verified milestones.
          </RevealText>
          <p className={styles.subheadline}>
            National hackathon rankings, algorithmic endurance, and technical leadership mapped across a central progression railway.
          </p>
        </div>

        {/* Central Railway Installation */}
        <div className={styles.railwayTrackArea}>
          {/* Central Track Spine */}
          <div className={styles.centralRail}>
            <div className={styles.railSleepers} aria-hidden="true" />
            <div className={styles.railSteelLeft} />
            <div className={styles.railSteelRight} />
            <TrainEngine progress={trainProgress} />
          </div>

          {/* Zigzag Achievement Stations (5 Competitive Milestones) */}
          <div className={styles.stationsList}>
            {achievementsData
              .filter((item) => item.id !== 'leetcode-solved')
              .map((item, idx) => {
                const isEven = idx % 2 === 1;
                const isFlipped = Boolean(flippedCards[item.id]);
                const hasImgError = Boolean(failedImages[item.id]);

                return (
                  <div
                    key={item.id}
                    className={`${styles.stationRow} ${isEven ? styles.rowRight : styles.rowLeft}`}
                  >
                    {/* Station Marker Node on Track */}
                    <div className={styles.trackMarker}>
                      <div className={styles.markerCircle}>
                        <span className={styles.markerNum}>0{idx + 1}</span>
                      </div>
                      <div className={styles.connectorArm} />
                    </div>

                    {/* 3D Flip Card at Station */}
                    <div
                      className={`${styles.flipCard} ${isFlipped ? styles.isFlipped : ''}`}
                      onClick={() => handleFlip(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleFlip(item.id);
                        }
                      }}
                      aria-label={`${item.title}. Click to flip.`}
                      data-cursor="pointer"
                    >
                      <div className={styles.flipInner}>
                        {/* Front: Milestone Card */}
                        <div className={styles.cardFront}>
                          <div className={styles.cardTop}>
                            <div className={styles.categoryBadge}>{item.category}</div>
                            <Trophy size={16} className={styles.trophyIcon} />
                          </div>

                          {/* Large Prominent Rank / Metric */}
                          <div className={styles.metricRow}>
                            {item.prefix && <span className={styles.prefix}>{item.prefix}</span>}
                            <span className={styles.metricNumber}>{item.metric}</span>
                            {item.suffix && <span className={styles.suffix}>{item.suffix}</span>}
                          </div>

                          <h3 className={styles.stationTitle}>{item.title}</h3>
                          <div className={styles.stationSubtitle}>{item.subtitle}</div>
                          <p className={styles.stationDescription}>{item.description}</p>

                          <div className={styles.cardBottom}>
                            <div className={styles.contextBadge}>
                              <Sparkles size={12} />
                              <span>{item.context}</span>
                            </div>
                            <span className={styles.flipLabel}>CLICK TO FLIP · VIEW PROOF →</span>
                          </div>
                        </div>

                        {/* Back: Verified Evidence / Intentional Placeholder */}
                        <div className={styles.cardBack}>
                          {!hasImgError ? (
                            <div
                              className={styles.revealedImageWrap}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInspect(item);
                              }}
                            >
                              <img
                                src={item.evidence.assetPath}
                                alt={item.evidence.caption}
                                className={styles.proofImg}
                                loading="lazy"
                                decoding="async"
                                onError={() =>
                                  setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                                }
                              />
                              <div className={styles.enlargeOverlay}>
                                <Eye size={16} />
                                <span>Enlarge Proof Document</span>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={styles.evidencePlaceholder}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInspect(item);
                              }}
                            >
                              <div className={styles.shieldWrap}>
                                <ShieldCheck size={28} />
                              </div>
                              <span className={styles.awaitingText}>Verified Milestone Record</span>
                              <span className={styles.expectedFileText}>{item.title}</span>
                              <p className={styles.proofCaption}>{item.evidence.caption}</p>
                              <div className={styles.viewMetaPrompt}>
                                <Eye size={12} />
                                <span>Click to view details</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Dedicated LeetCode & Multi-Platform DSA Showcase Card (Directly Visible, Zero Flip) */}
        <div className={styles.dsaShowcaseWrapper}>
          <div className={styles.dsaCard} role="region" aria-label="Algorithmic problem solving across coding platforms">
            <div className={styles.dsaCardHeader}>
              <div className={styles.dsaTag}>
                <Code2 size={15} color="#963BFA" />
                <span>Competitive Programming Rigor</span>
              </div>
              <div className={styles.dsaPlatformsList}>
                <span className={styles.platformPill}>LeetCode</span>
                <span className={styles.platformPill}>HackerRank</span>
                <span className={styles.platformPill}>Codeforces</span>
              </div>
            </div>

            <div className={styles.dsaMainContent}>
              <div className={styles.dsaMetricBlock}>
                <span className={styles.dsaBigNumber}>400</span>
                <span className={styles.dsaBigPlus}>+</span>
              </div>
              <div className={styles.dsaTextContent}>
                <h3 className={styles.dsaHeadline}>
                  400+ DSA problems solved across LeetCode, HackerRank, Codeforces, and other coding platforms.
                </h3>
                <p className={styles.dsaDescription}>
                  Disciplined algorithmic problem solving focusing on asymptotic efficiency, dynamic programming, graph traversal, trees, heap structures, and greedy paradigms. This total reflects cumulative problem-solving activity across multiple competitive coding platforms.
                </p>
              </div>
            </div>

            <div className={styles.dsaFooter}>
              <a
                href={siteConfig.socials.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.dsaProfileLink}
                data-cursor="pointer"
                aria-label="View Aditya's verified LeetCode profile in a new tab"
              >
                <span>View LeetCode Profile</span>
                <ArrowUpRight size={15} />
              </a>
              <span className={styles.dsaVerificationNote}>
                Verified Profile · {siteConfig.socials.leetcode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Accessible Image Lightbox Modal */}
      <ImageLightboxModal
        data={lightboxData}
        isOpen={Boolean(lightboxData)}
        onClose={() => setLightboxData(null)}
      />
    </section>
  );
};

export const Chapter07Achievements = Chapter06Achievements;
