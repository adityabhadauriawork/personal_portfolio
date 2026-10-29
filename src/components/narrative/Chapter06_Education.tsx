import React from 'react';
import { GraduationCap, MapPin, Calendar, Sparkles } from 'lucide-react';
import { educationData } from '../../data/education';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter06_Education.module.css';

/** Tasteful Stylized Geometric Academic Avatar with idle breathing and soft halo */
const AcademicAvatar: React.FC<{ variant: 'college' | 'highschool' | 'secondary' }> = ({ variant }) => {
  return (
    <div className={`${styles.avatarCanvas} ${styles[variant]}`}>
      <div className={styles.avatarGlowRing} />
      <svg className={styles.avatarSvg} viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`avatarGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="60%" stopColor="#963BFA" />
            <stop offset="100%" stopColor="#581C87" />
          </linearGradient>
        </defs>

        {/* Outer stylized portrait frame */}
        <circle cx="50" cy="50" r="44" stroke="rgba(169, 138, 232, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
        
        {/* Silhouette geometric body & shoulders */}
        <path
          d="M 22 84 C 24 64, 40 60, 50 60 C 60 60, 76 64, 78 84 Z"
          fill={`url(#avatarGrad-${variant})`}
          opacity="0.85"
        />

        {/* Head and features */}
        <circle cx="50" cy="40" r="16" fill="#FFFFFF" />
        <circle cx="50" cy="40" r="15" fill="#FAF5FF" stroke="rgba(169, 138, 232, 0.5)" strokeWidth="1" />

        {/* Stylized academic cap or crest accent */}
        {variant === 'college' && (
          <path
            d="M 34 32 L 50 24 L 66 32 L 50 38 Z"
            fill="#552080"
          />
        )}
        {variant === 'highschool' && (
          <polygon
            points="50,22 54,30 62,30 56,35 58,43 50,38 42,43 44,35 38,30 46,30"
            fill="#A855F7"
            transform="scale(0.55) translate(40, 20)"
          />
        )}
        {variant === 'secondary' && (
          <circle cx="50" cy="27" r="4" fill="#9333EA" />
        )}
      </svg>
      <span className={styles.avatarLabel}>Verified Student ID</span>
    </div>
  );
};

export const Chapter06Education: React.FC = () => {
  return (
    <section id="education" className={styles.section} aria-label="Academic Education">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>EDUCATION / 06</span>
            <span className={styles.separator}>·</span>
            <span>ACADEMIC FOUNDATION</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            Academic history and computational foundations.
          </RevealText>
          <p className={styles.subheadline}>
            A dedicated academic progression through collegiate Computer Science and foundational school sciences.
          </p>
        </div>

        {/* Academic ID-Card Cards Grid */}
        <div className={styles.idCardsGrid}>
          {educationData.map((edu, idx) => (
            <RevealBlock key={edu.id} delayMs={idx * 120} className={styles.idCardBlock}>
              <div className={styles.academicIdCard}>
                {/* ID Card Header Bar */}
                <div className={styles.cardTopBar}>
                  <div className={styles.institutionCrest}>
                    <GraduationCap size={16} />
                    <span>{edu.badge}</span>
                  </div>
                  <div className={styles.dateStamp}>
                    <Calendar size={13} />
                    <span>{edu.dates}</span>
                  </div>
                </div>

                {/* ID Card Main Body */}
                <div className={styles.cardMain}>
                  {/* Avatar / Portrait Panel */}
                  <AcademicAvatar variant={edu.avatarVariant} />

                  {/* Academic Record Details */}
                  <div className={styles.cardDetails}>
                    <h3 className={styles.institutionName}>{edu.institution}</h3>
                    <div className={styles.qualificationTitle}>
                      {edu.qualification}
                      {edu.degree && <span className={styles.degreeSpan}> · {edu.degree}</span>}
                    </div>

                    <div className={styles.locationRow}>
                      <MapPin size={13} />
                      <span>{edu.location}</span>
                    </div>

                    <p className={styles.shortDescription}>{edu.shortDescription}</p>

                    {/* Milestone Highlights */}
                    <div className={styles.highlightsList}>
                      {edu.highlights.map((h, i) => (
                        <div key={i} className={styles.highlightRow}>
                          <Sparkles size={12} className={styles.sparkleIcon} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ID Card Security Foil Footer (Rendered only when entry has institutional footer metadata) */}
                {edu.footerMeta && (
                  <div className={styles.securityFooter}>
                    <span className={styles.barcodePattern} aria-hidden="true" />
                    <span className={styles.verifiedIdText}>
                      {edu.footerMeta}
                    </span>
                  </div>
                )}
              </div>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
};
