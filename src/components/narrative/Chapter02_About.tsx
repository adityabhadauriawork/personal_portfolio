import React, { useState } from 'react';
import { ArrowRight, Compass, Cpu, Layers } from 'lucide-react';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter02_About.module.css';

interface Stage {
  id: 'understand' | 'engineer' | 'build';
  number: string;
  name: string;
  tagline: string;
  description: string;
  detail: string;
  icon: React.ReactNode;
}

const STAGES: Stage[] = [
  {
    id: 'understand',
    number: '01',
    name: 'Understand',
    tagline: 'Problem Space & Real Constraints',
    description: 'A focused cluster of points converges around the defined problem space.',
    detail: 'Breaking down requirements, understanding user needs, and identifying constraints early to guide decisions.',
    icon: <Compass size={18} />,
  },
  {
    id: 'engineer',
    number: '02',
    name: 'Engineer',
    tagline: 'Clean Architecture & Reliable Data Flow',
    description: 'The points form an interconnected, robust system of nodes, contracts, and pipelines.',
    detail: 'Designing clear interfaces, validating inputs, handling errors thoughtfully, and keeping code modular and maintainable.',
    icon: <Cpu size={18} />,
  },
  {
    id: 'build',
    number: '03',
    name: 'Build',
    tagline: 'Responsive, Thoughtful User Experience',
    description: 'The connected structure resolves into an intuitive, high-performance product.',
    detail: 'Delivering responsive layouts, accessible navigation, smooth visual feedback, and dependable everyday performance.',
    icon: <Layers size={18} />,
  },
];

interface Chapter02AboutProps {
  onExploreWork: () => void;
}

export const Chapter02About: React.FC<Chapter02AboutProps> = ({ onExploreWork }) => {
  const [activeStageId, setActiveStageId] = useState<'understand' | 'engineer' | 'build'>('engineer');
  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[1];

  return (
    <section id="about" className={styles.section} aria-label="About Aditya">
      <div className={styles.container}>
        {/* Editorial Subtitle / Chapter Index */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>ABOUT / 02</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            I turn complex ideas into useful software.
          </RevealText>
        </div>

        {/* Asymmetric Balanced Two-Column Composition */}
        <div className={styles.contentGrid}>
          {/* Left Column: Concise Editorial Story */}
          <RevealBlock className={styles.textColumn} delayMs={80}>
            <div className={styles.leadCard}>
              <p className={styles.leadParagraph}>
                I'm Aditya, a B.Tech Computer Science undergraduate at{' '}
                <strong>PSIT Kanpur (2024–2028)</strong>, exploring AI/ML and full-stack engineering.
              </p>
              <p className={styles.supportingParagraph}>
                I enjoy turning challenging problems into systems that are clear, useful, and dependable.
              </p>
            </div>

            {/* Quick Credentials / Status Pills */}
            <div className={styles.credentialPills}>
              <div className={styles.pillItem}>
                <span className={styles.pillLabel}>Degree</span>
                <span className={styles.pillValue}>B.Tech CSE '28</span>
              </div>
              <div className={styles.pillDivider} />
              <div className={styles.pillItem}>
                <span className={styles.pillLabel}>Focus</span>
                <span className={styles.pillValue}>AI/ML & Systems</span>
              </div>
              <div className={styles.pillDivider} />
              <div className={styles.pillItem}>
                <span className={styles.pillLabel}>Location</span>
                <span className={styles.pillValue}>Kanpur, India</span>
              </div>
            </div>

            <div className={styles.actionRow}>
              <button
                className={styles.exploreBtn}
                onClick={onExploreWork}
                data-cursor="pointer"
                aria-label="Jump to Selected Projects"
              >
                <span>Explore Selected Projects</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </RevealBlock>

          {/* Right Column: "From Idea to System" Interactive Installation */}
          <RevealBlock className={styles.visualColumn} delayMs={160}>
            <div className={styles.studioCard}>
              <div className={styles.studioHeader}>
                <div className={styles.studioTitleBlock}>
                  <span className={styles.studioEyebrow}>INTERACTIVE CONCEPT</span>
                  <h3 className={styles.studioTitle}>From Idea to System</h3>
                </div>
                <div className={styles.activePhaseIndicator}>
                  <span className={styles.phaseDot} />
                  <span>Phase {activeStage.number} / 03</span>
                </div>
              </div>

              {/* Connected 3-Stage Geometric System Canvas */}
              <div className={styles.stageVisualArea}>
                <svg
                  className={styles.networkSvg}
                  viewBox="0 0 460 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#963BFA" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#F472B6" stopOpacity="0.4" />
                    </linearGradient>
                    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Inter-stage connecting spine */}
                  <path
                    d="M 90 110 C 150 70, 170 150, 230 110 S 310 70, 370 110"
                    stroke="url(#pathGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className={styles.animatedSpine}
                  />

                  {/* Stage 1: Converging Points Cluster */}
                  <g
                    className={`${styles.svgStageGroup} ${activeStageId === 'understand' ? styles.svgActive : ''}`}
                    onClick={() => setActiveStageId('understand')}
                  >
                    <circle cx="90" cy="110" r="38" className={styles.nodeBackdropCircle} />
                    <circle cx="90" cy="110" r="24" className={styles.nodeCoreCircle} />
                    {/* Small orbital points converging around problem */}
                    <circle cx="75" cy="95" r="3.5" className={styles.convergePoint1} />
                    <circle cx="106" cy="98" r="3.0" className={styles.convergePoint2} />
                    <circle cx="82" cy="125" r="4.0" className={styles.convergePoint3} />
                    <circle cx="102" cy="122" r="3.0" className={styles.convergePoint4} />
                    <circle cx="90" cy="110" r="5" className={styles.centerNode} />
                    <text x="90" y="166" className={styles.nodeLabelText} textAnchor="middle">
                      Understand
                    </text>
                  </g>

                  {/* Dynamic connecting flow line between 1 and 2 */}
                  <line
                    x1="114"
                    y1="110"
                    x2="206"
                    y2="110"
                    stroke="#963BFA"
                    strokeWidth={activeStageId === 'engineer' || activeStageId === 'understand' ? '2.5' : '1.2'}
                    strokeOpacity={activeStageId === 'engineer' ? '0.9' : '0.4'}
                  />

                  {/* Stage 2: Connected System Nodes & Paths */}
                  <g
                    className={`${styles.svgStageGroup} ${activeStageId === 'engineer' ? styles.svgActive : ''}`}
                    onClick={() => setActiveStageId('engineer')}
                  >
                    <circle cx="230" cy="110" r="42" className={styles.nodeBackdropCircle} />
                    <circle cx="230" cy="110" r="26" className={styles.nodeCoreCircle} />
                    {/* Constellation web inside node */}
                    <line x1="218" y1="102" x2="242" y2="102" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                    <line x1="218" y1="102" x2="230" y2="122" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                    <line x1="242" y1="102" x2="230" y2="122" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                    <circle cx="218" cy="102" r="3.5" fill="#FFFFFF" />
                    <circle cx="242" cy="102" r="3.5" fill="#FFFFFF" />
                    <circle cx="230" cy="122" r="3.5" fill="#FFFFFF" />
                    <text x="230" y="166" className={styles.nodeLabelText} textAnchor="middle">
                      Engineer
                    </text>
                  </g>

                  {/* Dynamic connecting flow line between 2 and 3 */}
                  <line
                    x1="256"
                    y1="110"
                    x2="346"
                    y2="110"
                    stroke="#963BFA"
                    strokeWidth={activeStageId === 'build' ? '2.5' : '1.2'}
                    strokeOpacity={activeStageId === 'build' ? '0.9' : '0.4'}
                  />

                  {/* Stage 3: Resolved Product Interface */}
                  <g
                    className={`${styles.svgStageGroup} ${activeStageId === 'build' ? styles.svgActive : ''}`}
                    onClick={() => setActiveStageId('build')}
                  >
                    <circle cx="370" cy="110" r="38" className={styles.nodeBackdropCircle} />
                    <rect x="355" y="96" width="30" height="26" rx="4" className={styles.uiRectOuter} />
                    <rect x="359" y="100" width="22" height="4" rx="1.5" fill="#FFFFFF" opacity="0.9" />
                    <rect x="359" y="108" width="12" height="3" rx="1" fill="#FFFFFF" opacity="0.7" />
                    <rect x="359" y="114" width="18" height="3" rx="1" fill="#FFFFFF" opacity="0.7" />
                    <text x="370" y="166" className={styles.nodeLabelText} textAnchor="middle">
                      Build
                    </text>
                  </g>
                </svg>
              </div>

              {/* Stage Navigation Selector Tabs */}
              <div className={styles.stageSelectors} role="tablist">
                {STAGES.map((stage) => {
                  const isActive = stage.id === activeStageId;
                  return (
                    <button
                      key={stage.id}
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.selectorBtn} ${isActive ? styles.activeSelector : ''}`}
                      onClick={() => setActiveStageId(stage.id)}
                      onMouseEnter={() => setActiveStageId(stage.id)}
                      data-cursor="pointer"
                    >
                      <span className={styles.selectorNum}>{stage.number}</span>
                      <span className={styles.selectorName}>{stage.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Stage Live Narrative Card */}
              <div className={styles.stageNarrativeBox}>
                <div className={styles.narrativeHeader}>
                  <div className={styles.narrativeBadge}>
                    {activeStage.icon}
                    <span>{activeStage.tagline}</span>
                  </div>
                </div>
                <p className={styles.narrativeDescription}>{activeStage.description}</p>
                <p className={styles.narrativeDetail}>{activeStage.detail}</p>
              </div>
            </div>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
};
