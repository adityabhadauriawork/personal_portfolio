import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, CheckCircle2, Layers, Cpu, Compass } from 'lucide-react';
import { GithubIcon } from '../ui/BrandIcons';
import type { Project } from '../../data/projects';
import styles from './ProjectDetailModal.module.css';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  // ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerMeta}>
            <span className={styles.projectNumber}>PROJECT {project.number}</span>
            <span className={styles.separator}>·</span>
            <span className={styles.categoryBadge}>{project.category}</span>
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close project case study"
            data-cursor="pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className={styles.modalBody}>
          <h2 id="case-study-title" className={styles.projectTitle}>
            {project.title}
          </h2>
          <p className={styles.projectHeadline}>{project.headline}</p>

          {/* Action Links */}
          <div className={styles.actionLinks}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.liveBtn}
                data-cursor="pointer"
              >
                <span>Live Deployment</span>
                <ExternalLink size={15} />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubBtn}
                data-cursor="pointer"
              >
                <GithubIcon size={15} />
                <span>GitHub Workspace</span>
              </a>
            )}
          </div>

          {/* Structured Case Study Sections */}
          <div className={styles.caseStudyGrid}>
            {/* The Problem */}
            <div className={styles.caseSection}>
              <div className={styles.sectionTitleRow}>
                <Compass size={18} className={styles.sectionIcon} />
                <h3 className={styles.sectionHeading}>The Challenge & Problem</h3>
              </div>
              <p className={styles.sectionText}>{project.problem}</p>
            </div>

            {/* My Contribution */}
            <div className={styles.caseSection}>
              <div className={styles.sectionTitleRow}>
                <Layers size={18} className={styles.sectionIcon} />
                <h3 className={styles.sectionHeading}>My Engineering Contribution</h3>
              </div>
              <p className={styles.sectionText}>{project.contribution}</p>
            </div>

            {/* Engineering Approach */}
            <div className={styles.caseSection}>
              <div className={styles.sectionTitleRow}>
                <Cpu size={18} className={styles.sectionIcon} />
                <h3 className={styles.sectionHeading}>System Architecture & Approach</h3>
              </div>
              <p className={styles.sectionText}>{project.approach}</p>
            </div>
          </div>

          {/* Key Architectural Decisions */}
          <div className={styles.decisionsBox}>
            <h4 className={styles.boxTitle}>Key Architectural Decisions</h4>
            <div className={styles.decisionsList}>
              {project.keyDecisions.map((dec, i) => (
                <div key={i} className={styles.decisionItem}>
                  <CheckCircle2 size={16} className={styles.decisionCheck} />
                  <span>{dec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Substantiated Outcomes & Capabilities */}
          <div className={styles.outcomesBox}>
            <h4 className={styles.boxTitle}>Engineering Outcomes & Architecture Capabilities</h4>
            <div className={styles.outcomesList}>
              {project.outcomes.map((out, i) => (
                <div key={i} className={styles.outcomeItem}>
                  <span className={styles.outcomeBullet}>▸</span>
                  <span>{out}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies Stack */}
          <div className={styles.techStack}>
            <span className={styles.techLabel}>ENGINEERING STACK:</span>
            <div className={styles.techPills}>
              {project.technologies.map((tech) => (
                <span key={tech} className={styles.techPill}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <span className={styles.footerNote}>
            Verified project architecture · Aditya Pratap Singh Bhadauria
          </span>
          <button
            className={styles.footerCloseBtn}
            onClick={onClose}
            data-cursor="pointer"
          >
            Close Case Study
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
