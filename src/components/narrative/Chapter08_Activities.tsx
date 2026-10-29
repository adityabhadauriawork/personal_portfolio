import React from 'react';
import { activitiesData } from '../../data/activities';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter08_Activities.module.css';

export const Chapter08Activities: React.FC = () => {
  return (
    <section id="activities" className={styles.section} aria-label="Activities and Technical Initiatives">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>ACTIVITIES / 08</span>
            <span className={styles.separator}>·</span>
            <span>TECHNICAL INITIATIVES</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            Competitive sprints, engineering labs, and continuous practice.
          </RevealText>
          <p className={styles.subheadline}>
            Authentic technical engagements outside standard curriculum — including disciplined algorithmic problem solving, national hackathon prototyping sprints, and applied AI exploration.
          </p>
        </div>

        {/* Text-Led Architectural Activities Matrix */}
        <div className={styles.activitiesGrid}>
          {activitiesData.map((activity, idx) => (
            <RevealBlock key={activity.id} delayMs={idx * 90}>
              <article className={styles.activityCard} aria-labelledby={`activity-title-${activity.id}`}>
                {/* Top Row: Category Tag & Metric Badge */}
                <div className={styles.cardTopRow}>
                  <div className={styles.categoryTag}>
                    <span className={styles.categoryDot} />
                    <span>{activity.category}</span>
                  </div>

                  {activity.metric && (
                    <div className={styles.metricBadge}>
                      <span className={styles.metricVal}>{activity.metric}</span>
                      {activity.metricLabel && <span className={styles.metricLbl}>{activity.metricLabel}</span>}
                    </div>
                  )}
                </div>

                {/* Title & Context */}
                <h3 id={`activity-title-${activity.id}`} className={styles.activityTitle}>
                  {activity.title}
                </h3>
                <div className={styles.activityContext}>{activity.timeframe} · {activity.roleOrContext}</div>

                {/* Summary */}
                <p className={styles.activitySummary}>{activity.summary}</p>

                {/* Highlights */}
                <ul className={styles.highlightsList}>
                  {activity.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} className={styles.highlightItem}>
                      <span className={styles.highlightBullet} aria-hidden="true" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className={styles.tagsRow}>
                  {activity.tags.map((tag) => (
                    <span key={tag} className={styles.tagPill}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
};
