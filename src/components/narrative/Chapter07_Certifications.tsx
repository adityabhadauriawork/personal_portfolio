import React, { useState } from 'react';
import { ShieldCheck, Award, Eye, Bookmark } from 'lucide-react';
import { certificationsData, type CertificationItem } from '../../data/certifications';
import { ImageLightboxModal, type LightboxData } from './ImageLightboxModal';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter07_Certifications.module.css';

export const Chapter07Certifications: React.FC = () => {
  const [lightboxData, setLightboxData] = useState<LightboxData | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInspect = (cert: CertificationItem) => {
    setLightboxData({
      title: cert.title,
      subtitle: `${cert.issuer} · ${cert.badge}`,
      issuerOrCategory: cert.issuer,
      imagePath: cert.imagePath,
      details: cert.summary,
      tags: cert.skillsVerified,
      verificationNote: cert.verificationNote,
      badge: cert.badge,
    });
  };

  return (
    <section id="certificates" className={styles.section} aria-label="Certifications and Credentials">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>CERTIFICATES / 08</span>
            <span className={styles.separator}>·</span>
            <span>CREDENTIAL ARCHIVE</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            Verified credentials and technical program records.
          </RevealText>
          <p className={styles.subheadline}>
            A disciplined archive of professional simulations, machine learning learning paths, and systems engineering assessments.
          </p>
        </div>

        {/* Staggered Disciplined Credential Sleeve Wall */}
        <div className={styles.archiveGrid}>
          {certificationsData.map((cert, idx) => {
            const isFlipped = Boolean(flippedCards[cert.id]);
            const hasImgError = Boolean(failedImages[cert.id]);

            return (
              <RevealBlock key={cert.id} delayMs={idx * 80} className={styles.archiveCardWrapper}>
                <div
                  className={`${styles.archiveSleeve} ${isFlipped ? styles.isFlipped : ''}`}
                  onClick={() => handleFlip(cert.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleFlip(cert.id);
                    }
                  }}
                  aria-label={`${cert.title} by ${cert.issuer}. Click to flip.`}
                  data-cursor="pointer"
                >
                  <div className={styles.sleeveInner}>
                    {/* Front: Credential Folio Card */}
                    <div className={styles.sleeveFront}>
                      <div className={styles.folioTop}>
                        <div className={styles.issuerStamp}>
                          <Award size={16} />
                          <span>{cert.issuer}</span>
                        </div>
                        <span className={styles.badgePill}>{cert.badge}</span>
                      </div>

                      <div className={styles.folioBody}>
                        <h3 className={styles.certTitle}>{cert.title}</h3>
                        <p className={styles.certSummary}>{cert.summary}</p>
                      </div>

                      <div className={styles.skillsStrip}>
                        <div className={styles.skillsLabel}>VERIFIED SKILLS:</div>
                        <div className={styles.skillsPills}>
                          {cert.skillsVerified.map((sk) => (
                            <span key={sk} className={styles.skillPill}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={styles.folioBottom}>
                        <span className={styles.flipLabel}>CLICK TO FLIP · VIEW CERTIFICATE →</span>
                        <Bookmark size={14} className={styles.bookmarkIcon} />
                      </div>
                    </div>

                    {/* Back: Revealed Document Frame / Intentional Placeholder */}
                    <div className={styles.sleeveBack}>
                      {!hasImgError ? (
                        <div
                          className={styles.docFrame}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspect(cert);
                          }}
                        >
                          <img
                            src={cert.imagePath}
                            alt={`${cert.title} certificate`}
                            className={styles.certImage}
                            loading="lazy"
                            decoding="async"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [cert.id]: true }))
                            }
                          />
                          <div className={styles.enlargeOverlay}>
                            <Eye size={16} />
                            <span>Enlarge Certificate</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={styles.placeholderFrame}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspect(cert);
                          }}
                        >
                          <div className={styles.sealBadge}>
                            <ShieldCheck size={28} />
                          </div>
                          <span className={styles.awaitingTitle}>{cert.issuer}</span>
                          <span className={styles.badgePill}>{cert.badge}</span>
                          <p className={styles.certNote}>{cert.verificationNote}</p>
                          <div className={styles.inspectHint}>
                            <Eye size={12} />
                            <span>Click to view credential details</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </RevealBlock>
            );
          })}
        </div>
      </div>

      {/* Enlarged Accessible Certificate Lightbox Modal */}
      <ImageLightboxModal
        data={lightboxData}
        isOpen={Boolean(lightboxData)}
        onClose={() => setLightboxData(null)}
      />
    </section>
  );
};

export const Chapter08Certificates = Chapter07Certifications;
