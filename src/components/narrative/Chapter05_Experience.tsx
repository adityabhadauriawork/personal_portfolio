import React, { useState } from 'react';
import { MapPin, Calendar, CheckCircle2, FileText, Award, Eye, ShieldCheck } from 'lucide-react';
import { experiencesData, type InternshipEvidence } from '../../data/experience';
import { ImageLightboxModal, type LightboxData } from './ImageLightboxModal';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter05_Experience.module.css';

interface EvidenceTileProps {
  evidence: InternshipEvidence;
  organization: string;
  onInspect: (data: LightboxData) => void;
}

const EvidenceTile: React.FC<EvidenceTileProps> = ({ evidence, organization, onInspect }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const handleTileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  const handleOpenLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInspect({
      title: `${organization} — ${evidence.label}`,
      subtitle: evidence.verificationNote,
      issuerOrCategory: organization,
      imagePath: evidence.assetPath,
      details: evidence.verificationNote || `Official verified ${evidence.label} from ${organization}.`,
    });
  };

  const isOffer = evidence.type === 'offer-letter';

  return (
    <div
      className={`${styles.flipTile} ${isFlipped ? styles.isFlipped : ''}`}
      onClick={handleTileClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        }
      }}
      aria-label={`${evidence.label} for ${organization}. Click to flip.`}
      data-cursor="pointer"
    >
      <div className={styles.flipInner}>
        {/* Front Side: Clean Embossed Document Badge */}
        <div className={styles.flipFront}>
          <div className={styles.frontIconBadge}>
            {isOffer ? <FileText size={20} /> : <Award size={20} />}
          </div>
          <div className={styles.frontInfo}>
            <span className={styles.frontType}>{evidence.label}</span>
            <span className={styles.frontOrg}>{organization}</span>
          </div>
          <div className={styles.flipHint}>
            <span>CLICK TO FLIP · VIEW EVIDENCE</span>
          </div>
        </div>

        {/* Back Side: Revealed Evidence View or Intentional Placeholder */}
        <div className={styles.flipBack}>
          <div className={styles.backContent}>
            {!hasImageError ? (
              <div className={styles.imageRevealWrapper} onClick={handleOpenLightbox}>
                <img
                  src={evidence.assetPath}
                  alt={`${evidence.label} from ${organization}`}
                  className={styles.docImage}
                  loading="lazy"
                  decoding="async"
                  onError={() => setHasImageError(true)}
                />
                <div className={styles.imageOverlayAction}>
                  <Eye size={16} />
                  <span>Enlarge Document</span>
                </div>
              </div>
            ) : (
              <div className={styles.placeholderBackdrop} onClick={handleOpenLightbox}>
                <div className={styles.sealCircle}>
                  <ShieldCheck size={28} className={styles.sealIcon} />
                </div>
                <span className={styles.awaitingTitle}>Verified Internship Document</span>
                <span className={styles.expectedPathBadge}>{evidence.label}</span>
                <p className={styles.verificationNote}>{evidence.verificationNote}</p>
                <div className={styles.inspectPrompt}>
                  <Eye size={13} />
                  <span>Click to view details</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Chapter05Experience: React.FC = () => {
  const [lightboxData, setLightboxData] = useState<LightboxData | null>(null);

  return (
    <section id="experience" className={styles.section} aria-label="Work Experience">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>EXPERIENCE / 05</span>
            <span className={styles.separator}>·</span>
            <span>PROFESSIONAL TIMELINE</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            Internships, contributions, and verified evidence.
          </RevealText>
          <p className={styles.subheadline}>
            Practical software development and machine learning engineering contributions in production and research environments.
          </p>
        </div>

        {/* Chronological Internship Timeline */}
        <div className={styles.timelineList}>
          {experiencesData.map((exp, idx) => (
            <RevealBlock key={exp.id} delayMs={idx * 100} className={styles.experienceCardWrapper}>
              <article className={styles.experienceCard}>
                {/* Header Information */}
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <div className={styles.badgeWrap}>
                      <span className={styles.roleBadge}>{exp.badge || 'Engineering'}</span>
                    </div>
                    <h3 className={styles.roleTitle}>{exp.role}</h3>
                    <div className={styles.orgRow}>
                      <span className={styles.orgName}>{exp.organization}</span>
                      <span className={styles.separator}>·</span>
                      <span className={styles.location}>
                        <MapPin size={13} />
                        {exp.location}
                      </span>
                    </div>
                  </div>

                  <div className={styles.periodBadge}>
                    <Calendar size={13} />
                    <span>{exp.period}</span>
                  </div>
                </div>

                {/* 1-Sentence Summary */}
                <p className={styles.summarySentence}>{exp.summary}</p>

                {/* <=3 Meaningful Contributions */}
                <div className={styles.contributionsList}>
                  {exp.contributions.map((c, i) => (
                    <div key={i} className={styles.contributionItem}>
                      <CheckCircle2 size={15} className={styles.checkIcon} />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>

                {/* Short Tech List */}
                <div className={styles.techPillRow}>
                  {exp.skills.map((s) => (
                    <span key={s} className={styles.techPill}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Document Evidence Tiles: Offer Letter + Completion + Recommendation */}
                <div className={styles.evidenceSection}>
                  <div className={styles.evidenceSectionTitle}>
                    <span>VERIFIED INTERNSHIP CREDENTIALS:</span>
                  </div>
                  <div className={styles.evidenceGrid}>
                    {exp.evidence.map((ev) => (
                      <EvidenceTile
                        key={ev.id}
                        evidence={ev}
                        organization={exp.organization}
                        onInspect={(data) => setLightboxData(data)}
                      />
                    ))}
                  </div>
                </div>
              </article>
            </RevealBlock>
          ))}
        </div>
      </div>

      {/* Enlarged Accessible Document Lightbox */}
      <ImageLightboxModal
        data={lightboxData}
        isOpen={Boolean(lightboxData)}
        onClose={() => setLightboxData(null)}
      />
    </section>
  );
};
