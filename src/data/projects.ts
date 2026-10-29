export interface Project {
  id: string;
  number: string;
  title: string;
  category: string;
  tag: string;
  headline: string;
  shortDescription: string;
  problem: string;
  contribution: string;
  approach: string;
  keyDecisions: string[];
  technologies: string[];
  outcomes: string[];
  liveUrl?: string;
  githubUrl?: string;
  accentColor: string;
  image?: string;
}

export const projectsData: Project[] = [
  {
    id: 'automind-enterprise',
    number: '01',
    title: 'AutoMind Enterprise',
    category: 'Autonomous Systems & Analytics',
    tag: 'AI / Business Intelligence',
    headline: 'Multi-Agent Analytics & Predictive Intelligence Platform',
    shortDescription:
      'AI-powered business intelligence platform integrating data pipelines, predictive analytics, statistical forecasting, model management, and a language-model copilot.',
    problem:
      'Enterprises struggle with fragmented data silos and complex ad-hoc analytics workflows that require dedicated data engineering teams, resulting in delayed business decisions.',
    contribution:
      'Engineered an end-to-end intelligence suite featuring automated exploratory data analysis, forecasting algorithms, automated report generation, and natural-language conversational reasoning.',
    approach:
      'Constructed a modular pipeline combining statistical time-series forecasting, automated schema inference, semantic querying via LLM prompt orchestration, and interactive visual reporting.',
    keyDecisions: [
      'Implemented robust query caching to minimize LLM inference latency on recurrent questions.',
      'Separated computation-heavy modeling pipelines from the interactive UI to maintain responsive dashboards.',
      'Designed a structured JSON schema contract for LLM outputs to guarantee reliable chart rendering without parsing hallucinations.',
    ],
    technologies: ['Python', 'Streamlit', 'LangChain', 'Pandas', 'Scikit-Learn', 'Plotly', 'Groq / OpenAI API'],
    outcomes: [
      'Live deployed and accessible at automind-enterprise.streamlit.app.',
      'Seamless multi-format data ingestion (CSV, Excel) with automated data cleaning and statistical profiling.',
      'Integrated conversational copilot providing grounded insights alongside predictive charts.',
    ],
    liveUrl: 'https://automind-enterprise.streamlit.app/',
    githubUrl: 'https://github.com/adityabhadauriawork',
    accentColor: '#963BFA',
  },
  {
    id: 'react-x',
    number: '02',
    title: 'REACT-X',
    category: 'Industrial Systems & Disaster Mitigation',
    tag: 'Emergency Response / Geospatial ML',
    headline: 'Industrial Emergency-Response & Spatial Decision-Support Engine',
    shortDescription:
      'Industrial emergency-response and decision-support system combining simulated satellite and thermal data, machine learning risk assessment, and dynamic route optimization.',
    problem:
      'Industrial emergency response teams face extreme hazards and severe information fragmentation during chemical spills and plant fires, leading to dangerous evacuation bottlenecks.',
    contribution:
      'Architected a spatial hazard evaluation engine that ingests thermal matrices, assesses structural risk tiers, and dynamically recalculates safe traversal routes for rescue teams.',
    approach:
      'Built a graph-based routing engine using modified A* heuristics weighted by real-time thermal hazard gradients and toxic plume dispersion models.',
    keyDecisions: [
      'Integrated spatial graph representations to model plant floorplans and outdoor transit corridors under variable hazard zones.',
      'Prioritized deterministic algorithmic pathfinding over black-box methods to guarantee safety-critical predictability.',
      'Designed high-contrast, low-cognitive-load spatial telemetry interfaces for emergency dispatch operators.',
    ],
    technologies: ['Python', 'FastAPI', 'React', 'TypeScript', 'Leaflet', 'Scikit-Learn', 'NetworkX', 'GeoPandas'],
    outcomes: [
      'Multi-source sensor fusion simulation combining thermal thresholds and spatial coordinates.',
      'Real-time evacuation route calculation with dynamic hazard buffer zones.',
      'Modular microservice architecture allowing pluggable sensor inputs.',
    ],
    githubUrl: 'https://github.com/adityabhadauriawork',
    accentColor: '#8E65E2',
  },
  {
    id: 'opsforge',
    number: '03',
    title: 'OpsForge',
    category: 'Cloud-Native Infrastructure & Reliability',
    tag: 'Distributed Orchestration / Systems',
    headline: 'Cloud-Native Workflow Automation with Durable State Management',
    shortDescription:
      'Workflow automation platform built around event-driven processing, durable workflow states, exponential retries, idempotency controls, and failure recovery.',
    problem:
      'Distributed systems workflows frequently experience network blips, third-party API rate limits, and partial failures that corrupt state when idempotency and recovery are absent.',
    contribution:
      'Engineered an orchestration engine supporting DAG-based task definitions, persistent execution logs, automatic retries with jitter, and dead-letter queue management.',
    approach:
      'Utilized an event-driven architecture with transactional state persistence, distributed locks to prevent duplicate execution, and client-facing telemetry for workflow execution progress.',
    keyDecisions: [
      'Implemented transactional outbox pattern to ensure reliable event delivery to message brokers.',
      'Designed idempotent job handlers using unique execution keys and atomic Redis status checks.',
      'Provided a visual DAG editor to monitor step transitions and inspect failed execution nodes.',
    ],
    technologies: ['Node.js', 'TypeScript', 'Express', 'Redis', 'PostgreSQL', 'Docker', 'BullMQ', 'TailwindCSS'],
    outcomes: [
      'Resilient multi-step asynchronous workflow processing with automatic crash recovery.',
      'Low-overhead task dispatching backed by Redis in-memory queue structures.',
      'Comprehensive telemetry dashboard with state inspection and manual retry triggering.',
    ],
    githubUrl: 'https://github.com/adityabhadauriawork',
    accentColor: '#A98AE8',
  },
  {
    id: 'linkforge',
    number: '04',
    title: 'LinkForge',
    category: 'Distributed Services & Web Platforms',
    tag: 'Full-Stack / Microservices',
    headline: 'High-Concurrency URL Shortening & Real-Time Click Telemetry Engine',
    shortDescription:
      'Full-stack URL-shortening and analytics platform involving authentication, rate limiting, scalable database design, multi-tier caching, and real-time click analytics.',
    problem:
      'High-traffic redirect endpoints face massive read spikes that degrade underlying database performance if requests are not aggressively cached and validated.',
    contribution:
      'Built a full-stack platform featuring collision-free 62-base hash generation, dual-tier in-memory and Redis caching, geo-location enrichment, and click attribution analytics.',
    approach:
      'Engineered an asynchronous analytics logging pipeline that decouples HTTP 301/302 redirection from analytical database persistence, ensuring minimal redirection latency.',
    keyDecisions: [
      'Implemented sliding-window rate limiting via Redis to prevent brute-force generation and denial-of-service attempts.',
      'Designed an asynchronous event buffer for click event telemetry decoupled from redirection response.',
      'Created interactive SVG and chart dashboards displaying device breakdown, referrers, and geographic distribution.',
    ],
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Prisma', 'Chart.js', 'JWT'],
    outcomes: [
      'High-throughput redirect pipeline with dual-tier caching (in-memory RAM + Redis) and sliding-window rate limiting.',
      'Multi-tenant authentication with secure API key provisioning for developers.',
      'Real-time interactive dashboard visualizing traffic sources and temporal trends.',
    ],
    githubUrl: 'https://github.com/adityabhadauriawork',
    accentColor: '#552080',
  },
  {
    id: 'workforce-analytics',
    number: '05',
    title: 'Workforce Analytics & Job Market Intelligence',
    category: 'Data Engineering & Econometrics',
    tag: 'Data Engineering / Market Analytics',
    headline: 'Data Intelligence Pipeline for Tech Skill Demand & Compensation Trends',
    shortDescription:
      'Data engineering and analytics project exploring tech job-market trends, compensation benchmarks, skill co-occurrence, and workforce intelligence.',
    problem:
      'Engineers and recruiters operate in an opaque job market with inconsistent compensation disclosures and rapidly shifting technological skill requirements.',
    contribution:
      'Developed an automated data collection and transformation pipeline normalizing job postings to uncover latent compensation determinants and emerging skills.',
    approach:
      'Implemented robust web scraping with polite rate-limiting, natural language processing for skill entity extraction, and multivariate regression modeling on salary variables.',
    keyDecisions: [
      'Constructed a domain-specific dictionary and regex extractor for programming languages, frameworks, and cloud tools.',
      'Normalized compensation across currencies and equity structures into standardized annual figures.',
      'Built interactive filtering matrix allowing multi-dimensional cross-referencing of roles and tech stacks.',
    ],
    technologies: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'Seaborn', 'Matplotlib', 'Streamlit'],
    outcomes: [
      'Automated scraping and schema normalization pipeline handling variable job board structures.',
      'Identified high-value skill combinations in AI/ML and distributed cloud infrastructure.',
      'Interactive exploratory application enabling granular salary benchmarking.',
    ],
    githubUrl: 'https://github.com/adityabhadauriawork',
    accentColor: '#7C3AED',
  },
];
