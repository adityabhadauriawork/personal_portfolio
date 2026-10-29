import React from 'react';
import { Sparkles, Brain, Cpu, Layers, Palette, Award } from 'lucide-react';
import { useExperience } from '../../context/ExperienceContext';
import styles from './PhasePreviewSection.module.css';

const FLAGSHIP_PROJECTS = [
  {
    id: '01',
    name: 'AutoMind Enterprise',
    tag: 'Autonomous AI / Systems',
    desc: 'Autonomous multi-agent orchestration architecture designed for enterprise workflow automation, semantic reasoning pipelines, and structured decision synthesis.',
    phase: 'Case Study in Phase 2',
  },
  {
    id: '02',
    name: 'REACT-X',
    tag: 'Reactive Architecture',
    desc: 'Ultra-low latency reactive state engine and component framework engineered for high-throughput client applications with zero-drift synchronization.',
    phase: 'Case Study in Phase 2',
  },
  {
    id: '03',
    name: 'OpsForge',
    tag: 'DevOps & Telemetry',
    desc: 'Cloud-native CI/CD automation and infrastructure resilience platform featuring dynamic health scoring, automated rollbacks, and distributed logs.',
    phase: 'Case Study in Phase 2',
  },
  {
    id: '04',
    name: 'LinkForge',
    tag: 'Distributed Microservices',
    desc: 'Distributed graph linking and high-concurrency URL resolution engine backed by persistent caching, partition resilience, and real-time telemetry.',
    phase: 'Case Study in Phase 2',
  },
  {
    id: '05',
    name: 'Workforce Analytics',
    tag: 'Machine Learning',
    desc: 'Predictive enterprise analytics suite utilizing statistical modeling and machine learning to forecast workforce attrition and optimize resource allocation.',
    phase: 'Case Study in Phase 2',
  },
];

export const PhasePreviewSection: React.FC = () => {
  const { showNotification, setIsContactModalOpen } = useExperience();

  const handleProjectClick = (proj: (typeof FLAGSHIP_PROJECTS)[0]) => {
    showNotification(`${proj.name} — Detailed architecture breakdown and live demonstrations will arrive in Phase 2.`);
  };

  return (
    <section className={styles.previewSection} aria-label="Work & Academic Foundation">
      <div className={styles.previewContainer}>
        {/* ===================================================================
            1. ABOUT & ACADEMIC FOUNDATION (#about)
            =================================================================== */}
        <div id="about" className={styles.aboutCard}>
          <div>
            <span className={styles.eyebrow}>Academic & Technical Foundation</span>
            <h2 className={styles.aboutLead}>
              Rooted in foundational computer science, driven by modern intelligence.
            </h2>
            <p className={styles.aboutText}>
              I’m pursuing my <strong>B.Tech in Computer Science and Engineering</strong> at{' '}
              <strong>PSIT Kanpur</strong> (Graduation: 2028). My work bridges mathematical rigour,
              scalable software engineering, and modern generative intelligence.
            </p>
            <p className={styles.aboutText}>
              Rather than building superficial interfaces, I engineer dependable backend architectures,
              resilient distributed microservices, and AI-powered systems that withstand real-world constraints.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            <div className={styles.pillarBox}>
              <Brain size={20} color="var(--color-purple-electric)" style={{ marginBottom: '0.4rem' }} />
              <h3 className={styles.pillarTitle}>AI / ML Systems</h3>
              <p className={styles.pillarDesc}>Autonomous agent workflows, semantic reasoning, predictive analytics.</p>
            </div>

            <div className={styles.pillarBox}>
              <Cpu size={20} color="var(--color-purple-electric)" style={{ marginBottom: '0.4rem' }} />
              <h3 className={styles.pillarTitle}>Distributed Backend</h3>
              <p className={styles.pillarDesc}>High-concurrency services, reliable caching, resilient APIs.</p>
            </div>

            <div className={styles.pillarBox}>
              <Layers size={20} color="var(--color-purple-electric)" style={{ marginBottom: '0.4rem' }} />
              <h3 className={styles.pillarTitle}>Full-Stack Architecture</h3>
              <p className={styles.pillarDesc}>Type-safe React, modern TypeScript, resilient telemetry.</p>
            </div>

            <div className={styles.pillarBox}>
              <Palette size={20} color="var(--color-purple-electric)" style={{ marginBottom: '0.4rem' }} />
              <h3 className={styles.pillarTitle}>Creative Engineering</h3>
              <p className={styles.pillarDesc}>WebGL, Three.js shaders, thoughtful motion design.</p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. FLAGSHIP PROJECTS (#work)
            =================================================================== */}
        <div id="work">
          <div className={styles.sectionHeader} style={{ marginBottom: '2.5rem' }}>
            <span className={styles.eyebrow}>Flagship Engineering Portfolio</span>
            <h2 className={styles.sectionTitle}>Selected Systems & Applications</h2>
            <p style={{ color: 'var(--text-plum-muted)', fontSize: '0.95rem' }}>
              Architectural previews of systems in active development. Detailed case studies, live previews, and benchmarks will be published in subsequent phases.
            </p>
          </div>

          <div className={styles.projectsGrid}>
            {FLAGSHIP_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className={styles.projectCard}
                onClick={() => handleProjectClick(proj)}
                data-cursor="pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProjectClick(proj);
                }}
              >
                <div>
                  <div className={styles.cardHeader}>
                    <span className={styles.projectNumber}>{proj.id}</span>
                    <span className={styles.projectTag}>{proj.tag}</span>
                  </div>
                  <h3 className={styles.projectName}>{proj.name}</h3>
                  <p className={styles.projectDesc}>{proj.desc}</p>
                </div>

                <div className={styles.phaseBadge}>
                  <Sparkles size={13} />
                  <span>{proj.phase}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================
            3. ACHIEVEMENTS & CERTIFICATIONS ROADMAP (#achievements)
            =================================================================== */}
        <div id="achievements" className={styles.roadmapBanner}>
          <div className={styles.roadmapText}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <Award size={18} color="var(--color-purple-electric)" />
              <h3 className={styles.roadmapTitle}>Achievements & Certifications Roadmap</h3>
            </div>
            <p className={styles.roadmapSubtitle}>
              Phase 2 will integrate genuine certificate credentials, competitive programming benchmarks, hackathon victories, and verifiable credentials.
            </p>
          </div>

          <button
            className={styles.roadmapButton}
            onClick={() => setIsContactModalOpen(true)}
            data-cursor="pointer"
          >
            Inquire About Experience
          </button>
        </div>
      </div>
    </section>
  );
};
