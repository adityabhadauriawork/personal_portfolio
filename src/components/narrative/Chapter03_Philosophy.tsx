import React, { useState } from 'react';
import { Cpu, Network, Workflow, Database, ArrowRight, CheckCircle2, FolderGit2, Compass } from 'lucide-react';
import { RevealText } from '../effects/RevealText';
import { RevealBlock } from '../effects/RevealBlock';
import styles from './Chapter03_Philosophy.module.css';

interface ApproachStep {
  number: string;
  name: string;
  summary: string;
  focus: string;
}

interface EvidenceInfo {
  projectTitle: string;
  categoryTag: string;
  projectSummary: string;
  projectUrl: string;
  anchorId: string;
}

interface StackLayer {
  id: string;
  number: string;
  title: string;
  shortSummary: string;
  description: string;
  icon: React.ReactNode;
  steps: ApproachStep[];
  principles: string[];
  evidence: EvidenceInfo;
}

const LAYERS: StackLayer[] = [
  {
    id: 'layer-ai',
    number: '01',
    title: 'AI & Machine Learning',
    shortSummary:
      'I explore how machine learning can turn data into useful predictions and practical solutions, from preparing datasets to evaluating models.',
    description:
      'I focus on understanding the underlying problem and exploring data carefully before choosing a model. From cleaning datasets and engineering features to benchmarking against baselines and evaluating real-world utility, my aim is to build models that produce reliable, interpretable results.',
    icon: <Cpu size={20} />,
    steps: [
      {
        number: '01',
        name: 'Understand the problem',
        summary: 'Clarify the objective and establish success criteria before selecting any model architecture.',
        focus: 'Formulate domain objectives, understand constraints, and select evaluation metrics that match the true goal.',
      },
      {
        number: '02',
        name: 'Prepare the data',
        summary: 'Explore distributions, clean anomalies, and engineer features that represent the task faithfully.',
        focus: 'Conduct exploratory analysis, handle missing values, normalize scales, and construct relevant features.',
      },
      {
        number: '03',
        name: 'Evaluate models',
        summary: 'Train candidate approaches and benchmark them against transparent, realistic baselines.',
        focus: 'Compare multiple candidate models using domain-appropriate metrics such as precision, recall, F1, or ranking NDCG.',
      },
      {
        number: '04',
        name: 'Interpret the results',
        summary: 'Analyze errors, evaluate edge cases, and verify practical usefulness beyond aggregate benchmarks.',
        focus: 'Inspect false positives/negatives, understand model boundaries, and document practical limitations honestly.',
      },
    ],
    principles: [
      'Problem formulation before algorithm selection',
      'Thorough exploratory data analysis and feature hygiene',
      'Systematic comparison against baseline models',
      'Transparent analysis of error modes and limitations',
    ],
    evidence: {
      projectTitle: 'AutoMind Enterprise, FlyRank AI & Search Ranking Capstone',
      categoryTag: 'Relevant Project / Evidence',
      projectSummary:
        'Contributed to semantic search pipelines and ranking evaluation (NDCG/MRR) at FlyRank AI, modeled search ranking and discoverability features in my capstone work, and built data-driven forecasting in AutoMind Enterprise.',
      projectUrl: 'https://automind-enterprise.streamlit.app/',
      anchorId: 'projects',
    },
  },
  {
    id: 'layer-backend',
    number: '02',
    title: 'Backend Systems',
    shortSummary:
      'I enjoy building the services and data flows that connect applications, handle information carefully, and make software dependable.',
    description:
      'I enjoy designing the interfaces and data paths that keep applications dependable. I prioritize clear schemas, structured input validation, predictable error handling, modular services, and thoughtful data access patterns.',
    icon: <Network size={20} />,
    steps: [
      {
        number: '01',
        name: 'Define the interface',
        summary: 'Establish clear API contracts, request/response schemas, and component boundaries.',
        focus: 'Design intuitive RESTful endpoints and type-safe data contracts that make client-server communication clear.',
      },
      {
        number: '02',
        name: 'Validate the data',
        summary: 'Enforce strict schema validation and sanitize inputs at application boundaries.',
        focus: 'Validate incoming payloads early to prevent corrupt state, invalid queries, and unhandled edge cases.',
      },
      {
        number: '03',
        name: 'Handle failures',
        summary: 'Design structured error responses, graceful fallbacks, and resilient retry logic.',
        focus: 'Ensure failures produce clear, actionable error codes and messages while keeping core services stable.',
      },
      {
        number: '04',
        name: 'Test the behavior',
        summary: 'Verify API endpoints, database interactions, and edge cases to ensure dependable operation.',
        focus: 'Write focused tests covering happy paths, boundary conditions, and unexpected input handling.',
      },
    ],
    principles: [
      'Type-safe contracts across client and server boundaries',
      'Defensive input validation and structured error responses',
      'Intelligent caching to protect underlying datastores',
      'Modular service structure with maintainable logic',
    ],
    evidence: {
      projectTitle: 'LinkForge, OpsForge & Health Nexus',
      categoryTag: 'Relevant Project / Evidence',
      projectSummary:
        'Built URL redirection and Redis caching in LinkForge, asynchronous workflow retries in OpsForge, and connected Raspberry Pi / ESP32 hardware-software data flows for assistive control in Health Nexus.',
      projectUrl: 'https://github.com/adityabhadauriawork',
      anchorId: 'projects',
    },
  },
  {
    id: 'layer-product',
    number: '03',
    title: 'Product Engineering',
    shortSummary:
      'I enjoy turning ideas into responsive, thoughtful interfaces where the details feel natural and the experience stays easy to use.',
    description:
      'I care deeply about how software feels in everyday use. I focus on responsive layouts, accessible navigation, layout stability, and subtle interactive feedback that feels intentional without distracting the user.',
    icon: <Workflow size={20} />,
    steps: [
      {
        number: '01',
        name: 'Understand the user',
        summary: 'Identify primary tasks, simplify navigation paths, and minimize cognitive friction.',
        focus: 'Structure content hierarchy around what visitors actually need to accomplish or understand first.',
      },
      {
        number: '02',
        name: 'Build the experience',
        summary: 'Create modular, type-safe components with semantic HTML and maintainable CSS modules.',
        focus: 'Implement responsive layouts, maintain zero unintended layout shift, and isolate component styling.',
      },
      {
        number: '03',
        name: 'Test interactions',
        summary: 'Verify keyboard navigation, responsive breakpoints, screen readers, and frame pacing.',
        focus: 'Ensure buttons, modals, and navigation behave predictably on desktop, tablet, and mobile displays.',
      },
      {
        number: '04',
        name: 'Refine the details',
        summary: 'Polish micro-interactions, layout transitions, and subtle feedback that makes the interface feel natural.',
        focus: 'Harmonize typography, spacing, and animations while fully respecting prefers-reduced-motion.',
      },
    ],
    principles: [
      'Strict TypeScript interfaces across all components',
      'Zero-layout-shift design and responsive breakpoints',
      'Accessible keyboard focus and semantic ARIA roles',
      'Full respect for reduced-motion system preferences',
    ],
    evidence: {
      projectTitle: 'Creative 3D Portfolio, Prodigy InfoTech & Health Nexus',
      categoryTag: 'Relevant Project / Evidence',
      projectSummary:
        'Developed modular React UI components at Prodigy InfoTech, designed accessible assistive interfaces in Health Nexus, and engineered this interactive React + Three.js portfolio.',
      projectUrl: 'https://github.com/adityabhadauriawork',
      anchorId: 'projects',
    },
  },
  {
    id: 'layer-data',
    number: '04',
    title: 'Data Engineering',
    shortSummary:
      'I work with data from cleaning and transformation through analysis and forecasting, with a focus on making the results useful.',
    description:
      'I work across the data lifecycle, from collecting and cleaning messy datasets to modeling trends and presenting actionable findings through clear dashboards and reports.',
    icon: <Database size={20} />,
    steps: [
      {
        number: '01',
        name: 'Explore the data',
        summary: 'Audit source formats, examine distributions, and detect missing or inconsistent values early.',
        focus: 'Profile data shapes, detect anomalies, and understand schema quirks before writing transformation code.',
      },
      {
        number: '02',
        name: 'Clean and transform',
        summary: 'Normalize fields, handle edge cases, and structure clean tabular datasets for modeling.',
        focus: 'Standardize naming, handle null values appropriately, and build reproducible transformation scripts.',
      },
      {
        number: '03',
        name: 'Analyze and model',
        summary: 'Apply statistical analysis, multivariate regression, or time-series forecasting.',
        focus: 'Select statistical techniques suited to the dataset size, detecting trends without overfitting.',
      },
      {
        number: '04',
        name: 'Communicate insights',
        summary: 'Synthesize findings into intuitive visualizations, executive metrics, and clear reports.',
        focus: 'Present actionable insights clearly using interactive charts, summary metrics, and plain-English context.',
      },
    ],
    principles: [
      'Automated data profiling and missing-value handling',
      'Reproducible cleaning scripts with schema validation',
      'Applied statistical modeling and trend forecasting',
      'Visual dashboards focused on actionable takeaways',
    ],
    evidence: {
      projectTitle: 'AutoMind Enterprise, Search Ranking Capstone & Workforce Analytics',
      categoryTag: 'Relevant Project / Evidence',
      projectSummary:
        'Created automated data profiling and statistical forecasting in AutoMind Enterprise, cleaned and engineered ranking features for the Google Search Ranking & Discoverability Capstone, and analyzed job market trends.',
      projectUrl: 'https://automind-enterprise.streamlit.app/',
      anchorId: 'projects',
    },
  },
];

export const Chapter03Philosophy: React.FC = () => {
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeLayer = LAYERS[activeLayerIndex];
  const activeStep = activeLayer.steps[activeStepIndex] || activeLayer.steps[0];

  const handleSelectLayer = (idx: number) => {
    setActiveLayerIndex(idx);
    setActiveStepIndex(0);
  };

  const handleJumpToProjects = () => {
    const el = document.getElementById(activeLayer.evidence.anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="approach" className={styles.section} aria-label="Engineering Approach">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.chapterNumber}>APPROACH / 03</span>
            <span className={styles.separator}>·</span>
            <span>HOW I WORK</span>
          </div>
          <RevealText tag="h2" className={styles.headline}>
            How I approach engineering challenges.
          </RevealText>
          <p className={styles.subheadline}>
            A structured, grounded approach to solving problems across machine learning, backend services, responsive interfaces, and data engineering.
          </p>
        </div>

        {/* Two-Column Composition: Capability Layers + Expanded Working Approach */}
        <div className={styles.studioGrid}>
          {/* Left: Layered Capability Stack Selector */}
          <RevealBlock className={styles.stackColumn} delayMs={100}>
            <div className={styles.stackPerspectiveWrapper}>
              {LAYERS.map((layer, idx) => {
                const isSelected = idx === activeLayerIndex;
                const offsetZ = (LAYERS.length - 1 - idx) * 14;
                const translateY = idx * 6;

                return (
                  <div
                    key={layer.id}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                    className={`${styles.stackSlab} ${isSelected ? styles.slabSelected : ''}`}
                    style={{
                      transform: isSelected
                        ? `translate3d(0, ${translateY - 8}px, ${offsetZ + 24}px) scale(1.02)`
                        : `translate3d(0, ${translateY}px, ${offsetZ}px)`,
                      zIndex: isSelected ? 20 : 10 - idx,
                    }}
                    onClick={() => handleSelectLayer(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelectLayer(idx);
                      }
                    }}
                    data-cursor="pointer"
                  >
                    <div className={styles.slabHeader}>
                      <div className={styles.slabNumber}>Layer {layer.number}</div>
                      <div className={styles.slabIconWrap}>{layer.icon}</div>
                    </div>
                    <h3 className={styles.slabTitle}>{layer.title}</h3>
                    <p className={styles.slabSummary}>{layer.shortSummary}</p>
                    <div className={styles.slabIndicator} />
                  </div>
                );
              })}
            </div>
          </RevealBlock>

          {/* Right: Expanded Personal Capability Panel */}
          <RevealBlock className={styles.detailColumn} delayMs={180}>
            <div className={styles.detailCard}>
              {/* Header Badge */}
              <div className={styles.detailHeader}>
                <div className={styles.layerBadge}>
                  {activeLayer.icon}
                  <span>LAYER {activeLayer.number} — {activeLayer.title}</span>
                </div>
              </div>

              <h4 className={styles.detailHeading}>{activeLayer.title}</h4>
              <p className={styles.detailDescription}>{activeLayer.description}</p>

              {/* How I Work: 4-Step Interactive Progression */}
              <div className={styles.approachWorkspace}>
                <div className={styles.approachTitleBar}>
                  <Compass size={14} color="var(--color-purple-electric)" />
                  <span>How I approach the work</span>
                  <span className={styles.stepCounter}>
                    Step {activeStep.number} of {activeLayer.steps.length}
                  </span>
                </div>

                {/* 4-Step Flow Buttons */}
                <div className={styles.stepProgressionList} role="tablist" aria-label="Approach stages">
                  {activeLayer.steps.map((st, sIdx) => {
                    const isStepActive = sIdx === activeStepIndex;
                    return (
                      <button
                        key={st.number}
                        role="tab"
                        aria-selected={isStepActive}
                        className={`${styles.stepButton} ${isStepActive ? styles.stepButtonActive : ''}`}
                        onClick={() => setActiveStepIndex(sIdx)}
                        data-cursor="pointer"
                      >
                        <span className={styles.stepNumPill}>{st.number}</span>
                        <span className={styles.stepNameLabel}>{st.name}</span>
                        {sIdx < activeLayer.steps.length - 1 && (
                          <span className={styles.stepArrowIndicator} aria-hidden="true">
                            <ArrowRight size={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Step Detail Spotlight Card */}
                <div className={styles.stepDetailCard}>
                  <div className={styles.stepDetailHeader}>
                    <span className={styles.stepDetailNumber}>Stage {activeStep.number}</span>
                    <h5 className={styles.stepDetailTitle}>{activeStep.name}</h5>
                  </div>
                  <p className={styles.stepDetailSummary}>{activeStep.summary}</p>
                  <div className={styles.stepFocusBox}>
                    <span className={styles.stepFocusTag}>Key Focus</span>
                    <p className={styles.stepFocusText}>{activeStep.focus}</p>
                  </div>
                </div>
              </div>

              {/* Grounded Principles */}
              <div className={styles.principlesContainer}>
                <div className={styles.principlesTitle}>Core Engineering Practices:</div>
                <div className={styles.principlesGrid}>
                  {activeLayer.principles.map((pr, i) => (
                    <div key={i} className={styles.principleItem}>
                      <CheckCircle2 size={15} className={styles.principleCheck} />
                      <span>{pr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relevant Project / Authentic Evidence Reference */}
              <div className={styles.evidenceContainer}>
                <div className={styles.evidenceHeader}>
                  <FolderGit2 size={15} color="var(--color-purple-electric)" />
                  <span className={styles.evidenceBadge}>{activeLayer.evidence.categoryTag}</span>
                </div>
                <div className={styles.evidenceContent}>
                  <h5 className={styles.evidenceTitle}>{activeLayer.evidence.projectTitle}</h5>
                  <p className={styles.evidenceSummary}>{activeLayer.evidence.projectSummary}</p>
                </div>
                <div className={styles.evidenceAction}>
                  <button
                    className={styles.viewProjectBtn}
                    onClick={handleJumpToProjects}
                    data-cursor="pointer"
                    aria-label={`View ${activeLayer.evidence.projectTitle} in Projects`}
                  >
                    <span>View in Projects</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
};

export const Chapter03Approach = Chapter03Philosophy;
