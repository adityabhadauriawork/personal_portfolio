import React, { useState } from 'react';
import { skillDomainsData } from '../../data/skills';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter09_Skills.module.css';

export const Chapter09Skills: React.FC = () => {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  const activeDomain =
    skillDomainsData.find((d) => d.id === selectedDomainId) || null;

  return (
    <section id="skills" className={styles.section} aria-label="Technical Skills">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>SKILLS / 09</span>
            <span className={styles.separator}>·</span>
            <span>STRUCTURED SYSTEMS MATRIX</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            Concise, structured technical repertoire.
          </RevealText>
          <p className={styles.subheadline}>
            Eight disciplined engineering domains covering algorithms, machine learning representations, backend reliability, and creative systems.
          </p>
        </div>

        {/* Disciplined Editorial Skills Matrix */}
        <div className={styles.matrixGrid}>
          {skillDomainsData.map((domain, idx) => {
            const isSelected = domain.id === selectedDomainId;

            return (
              <RevealBlock key={domain.id} delayMs={idx * 60} className={styles.matrixCellBlock}>
                <div
                  className={`${styles.matrixCard} ${isSelected ? styles.cardActive : ''}`}
                  onClick={() =>
                    setSelectedDomainId((prev) => (prev === domain.id ? null : domain.id))
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDomainId((prev) => (prev === domain.id ? null : domain.id));
                    }
                  }}
                  data-cursor="pointer"
                  aria-label={`${domain.category}. Click to focus.`}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.domainNumber}>{domain.number}</span>
                    <h3 className={styles.domainTitle}>{domain.category}</h3>
                  </div>

                  <p className={styles.domainDescription}>{domain.description}</p>

                  {/* Skills Grid */}
                  <div className={styles.skillsTagList}>
                    {domain.skills.map((skill) => (
                      <span key={skill} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className={styles.activeBorderGlow} />
                </div>
              </RevealBlock>
            );
          })}
        </div>

        {/* Selected Domain Focus Banner */}
        {activeDomain && (
          <div className={styles.focusBanner}>
            <div className={styles.focusTitle}>
              Focused Domain: {activeDomain.number} — {activeDomain.category}
            </div>
            <p className={styles.focusText}>{activeDomain.description}</p>
          </div>
        )}
      </div>
    </section>
  );
};
