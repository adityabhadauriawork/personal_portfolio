import React, { useState } from 'react';
import {
  ExternalLink,
  ArrowUpRight,
  ShieldAlert,
  Navigation as NavigationIcon,
} from 'lucide-react';
import { GithubIcon } from '../ui/BrandIcons';
import { projectsData, type Project } from '../../data/projects';
import { ProjectDetailModal } from './ProjectDetailModal';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter04_Projects.module.css';

// =============================================================================
// Distinct Project-Specific Visual Previews (No Repetitive Dark Boxes)
// =============================================================================

/** AutoMind Enterprise: Dashboard & Forecasting Chart Preview */
const AutoMindPreview: React.FC = () => (
  <div className={styles.previewDashboard}>
    <div className={styles.dashHeader}>
      <span className={styles.dashPill}>Live Platform</span>
      <span className={styles.dashMeta}>automind-enterprise.streamlit.app</span>
    </div>
    <div className={styles.dashChart}>
      <div className={styles.chartBars}>
        <div className={styles.barItem} style={{ height: '45%' }}><span className={styles.barVal}>Q1</span></div>
        <div className={styles.barItem} style={{ height: '65%' }}><span className={styles.barVal}>Q2</span></div>
        <div className={styles.barItem} style={{ height: '85%' }}><span className={styles.barVal}>Q3</span></div>
        <div className={`${styles.barItem} ${styles.barActive}`} style={{ height: '95%' }}><span className={styles.barVal}>Q4*</span></div>
      </div>
      <div className={styles.forecastLine} />
    </div>
    <div className={styles.dashFooter}>
      <span className={styles.dashPrompt}>Copilot Query: "Forecast revenue trajectory with seasonal weight"</span>
      <span className={styles.dashBadge}>Pydantic Grounded</span>
    </div>
  </div>
);

/** REACT-X: Geospatial Hazard Map & Route Preview */
const ReactXPreview: React.FC = () => (
  <div className={styles.previewGeospatial}>
    <div className={styles.geoHeader}>
      <div className={styles.geoStatus}>
        <ShieldAlert size={13} className={styles.hazardIcon} />
        <span>Thermal Hazard Evaluation Grid</span>
      </div>
      <span className={styles.geoCoord}>26.4499° N, 80.3319° E</span>
    </div>
    <div className={styles.geoMapArea}>
      <div className={styles.gridOverlay} />
      {/* Hazard Zone */}
      <div className={styles.hazardZone}>
        <span className={styles.hazardLabel}>Thermal Gradient Zone</span>
      </div>
      {/* Evacuation Route */}
      <svg className={styles.routeSvg} viewBox="0 0 260 110">
        <path
          d="M 20 90 Q 70 30, 140 70 T 240 25"
          fill="none"
          stroke="#10B981"
          strokeWidth="3"
          strokeDasharray="5 3"
        />
        <circle cx="20" cy="90" r="5" fill="#3B82F6" />
        <circle cx="240" cy="25" r="5" fill="#10B981" />
      </svg>
      <div className={styles.safeBeacon}>
        <NavigationIcon size={12} />
        <span>Optimal Traversal Path</span>
      </div>
    </div>
    <div className={styles.geoFooter}>
      <span>A* Pathfinding · Dynamic Obstacle Penalty Matrix</span>
    </div>
  </div>
);

/** OpsForge: Workflow DAG & State Transitions Preview */
const OpsForgePreview: React.FC = () => (
  <div className={styles.previewWorkflow}>
    <div className={styles.wfHeader}>
      <span className={styles.wfTitle}>Durable Task DAG Pipeline</span>
      <span className={styles.wfStatus}>Status: Running (Worker 03)</span>
    </div>
    <div className={styles.wfPipeline}>
      <div className={`${styles.wfNode} ${styles.wfDone}`}>
        <span className={styles.wfStep}>01</span>
        <span className={styles.wfLabel}>Ingest</span>
      </div>
      <span className={styles.wfArrow}>→</span>
      <div className={`${styles.wfNode} ${styles.wfDone}`}>
        <span className={styles.wfStep}>02</span>
        <span className={styles.wfLabel}>Idempotency</span>
      </div>
      <span className={styles.wfArrow}>→</span>
      <div className={`${styles.wfNode} ${styles.wfActive}`}>
        <span className={styles.wfStep}>03</span>
        <span className={styles.wfLabel}>Execute</span>
      </div>
      <span className={styles.wfArrow}>→</span>
      <div className={styles.wfNode}>
        <span className={styles.wfStep}>04</span>
        <span className={styles.wfLabel}>Outbox</span>
      </div>
    </div>
    <div className={styles.wfFooter}>
      <span>Fault Recovery: Exponential Backoff with Jitter · Redis Queue</span>
    </div>
  </div>
);

/** LinkForge (MERN Stack): Telemetry & Redirect Engine Preview */
const LinkForgePreview: React.FC = () => (
  <div className={styles.previewTelemetry}>
    <div className={styles.telemetryHeader}>
      <div className={styles.telemetryBadge}>MERN Stack Engine</div>
      <span className={styles.telemetryUrl}>/lnk/v9x4p → Destination</span>
    </div>
    <div className={styles.telemetryStats}>
      <div className={styles.statCol}>
        <span className={styles.statNum}>&lt; 4ms</span>
        <span className={styles.statLabel}>Cache Latency</span>
      </div>
      <div className={styles.statCol}>
        <span className={styles.statNum}>62-Base</span>
        <span className={styles.statLabel}>Key Hash</span>
      </div>
      <div className={styles.statCol}>
        <span className={styles.statNum}>99.9%</span>
        <span className={styles.statLabel}>Cache Hit Ratio</span>
      </div>
    </div>
    <div className={styles.telemetryFooter}>
      <span>Async Event Buffer · Dual-Tier Redis & MongoDB</span>
    </div>
  </div>
);

/** Workforce Analytics: Skill Demand & Salary Trend Preview */
const WorkforcePreview: React.FC = () => (
  <div className={styles.previewMarket}>
    <div className={styles.marketHeader}>
      <span className={styles.marketTitle}>Job Market Skill Co-occurrence</span>
      <span className={styles.marketTag}>ETL Pipeline & EDA</span>
    </div>
    <div className={styles.skillsDistribution}>
      <div className={styles.marketSkillBar}>
        <div className={styles.skillBarHeader}>
          <span>AI / Machine Learning + Distributed Systems</span>
          <span>94th %ile</span>
        </div>
        <div className={styles.skillBarTrack}><div className={styles.skillBarFill} style={{ width: '92%' }} /></div>
      </div>
      <div className={styles.marketSkillBar}>
        <div className={styles.skillBarHeader}>
          <span>Data Engineering (ETL + Streaming)</span>
          <span>87th %ile</span>
        </div>
        <div className={styles.skillBarTrack}><div className={styles.skillBarFill} style={{ width: '84%' }} /></div>
      </div>
    </div>
    <div className={styles.marketFooter}>
      <span>Multivariate Salary Regression on Standardized Scraped Postings</span>
    </div>
  </div>
);

export const Chapter04Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleOpenCaseStudy = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <section id="projects" className={styles.section} aria-label="Projects">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>PROJECTS / 04</span>
            <span className={styles.separator}>·</span>
            <span>SELECTED WORK</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            Selected projects and working case studies.
          </RevealText>
          <p className={styles.subheadline}>
            Five flagship projects built to solve genuine computational, industrial, and algorithmic challenges.
          </p>
        </div>

        {/* Project Cards Roster */}
        <div className={styles.projectList}>
          {projectsData.map((project, index) => {
            const isEven = index % 2 === 1;
            const isMern = project.id === 'linkforge';

            return (
              <RevealBlock key={project.id} delayMs={index * 60}>
                <article
                  className={`${styles.projectCard} ${isEven ? styles.cardReversed : ''}`}
                >
                  {/* Left Column: Purpose & Information */}
                  <div className={styles.infoCol}>
                    <div className={styles.metaRow}>
                      <span className={styles.projectNum}>{project.number}</span>
                      <span className={styles.separator}>/</span>
                      <span className={styles.categoryLabel}>{project.category}</span>
                      {isMern && <span className={styles.mernBadge}>MERN Stack</span>}
                    </div>

                    <h3 className={styles.projectTitle}>
                      {project.title} {isMern && <span className={styles.mernInline}>(MERN Stack)</span>}
                    </h3>

                    <p className={styles.projectHeadline}>{project.headline}</p>

                    <p className={styles.projectDescription}>{project.shortDescription}</p>

                    {/* Tech Pills */}
                    <div className={styles.techPills}>
                      {project.technologies.slice(0, 5).map((tech) => (
                        <span key={tech} className={styles.techPill}>
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className={styles.moreTechPill}>
                          +{project.technologies.length - 5}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={styles.actionRow}>
                      <button
                        className={styles.viewCaseStudyBtn}
                        onClick={() => handleOpenCaseStudy(project)}
                        aria-label={`View full case study for ${project.title}`}
                        data-cursor="pointer"
                      >
                        <span>View Case Study</span>
                        <ArrowUpRight size={15} />
                      </button>

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.secondaryLink}
                          data-cursor="pointer"
                          aria-label={`Open live deployment for ${project.title}`}
                        >
                          <ExternalLink size={15} />
                          <span>Live Demo</span>
                        </a>
                      )}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.secondaryLink}
                          data-cursor="pointer"
                          aria-label={`View GitHub repository for ${project.title}`}
                        >
                          <GithubIcon size={15} />
                          <span>Repository</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Distinct Product Visual Preview */}
                  <div
                    className={styles.previewCol}
                    onClick={() => handleOpenCaseStudy(project)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleOpenCaseStudy(project);
                    }}
                    aria-label={`Open case study view for ${project.title}`}
                    data-cursor="pointer"
                  >
                    <div className={styles.previewFrame}>
                      {project.id === 'automind-enterprise' && <AutoMindPreview />}
                      {project.id === 'react-x' && <ReactXPreview />}
                      {project.id === 'opsforge' && <OpsForgePreview />}
                      {project.id === 'linkforge' && <LinkForgePreview />}
                      {project.id === 'workforce-analytics' && <WorkforcePreview />}
                      
                      <div className={styles.clickHint}>
                        <span>Click to examine case study →</span>
                      </div>
                    </div>
                  </div>
                </article>
              </RevealBlock>
            );
          })}
        </div>
      </div>

      {/* Case Study Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
