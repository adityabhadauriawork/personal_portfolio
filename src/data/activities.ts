/**
 * Activities Data
 * Authentic technical initiatives, hackathons, open algorithmic practice,
 * and academic innovation engagements.
 */

export interface ActivityItem {
  id: string;
  category: string;
  title: string;
  roleOrContext: string;
  timeframe: string;
  summary: string;
  highlights: string[];
  tags: string[];
  metric?: string;
  metricLabel?: string;
}

export const activitiesData: ActivityItem[] = [
  {
    id: 'algorithmic-sprints',
    category: 'Competitive Programming',
    title: 'Algorithmic Problem Solving & Daily Practice',
    roleOrContext: 'Independent Algorithmic Practice',
    timeframe: 'Ongoing · Multi-Platform',
    summary:
      'Continuous daily training across LeetCode, HackerRank, Codeforces, and competitive programming archives. Focused on asymptotic time/space optimization, dynamic programming state transitions, graph traversal algorithms, tree algorithms, and heap structures.',
    highlights: [
      'Solved 400+ algorithmic problems across LeetCode, HackerRank, Codeforces, and other platforms',
      'Consistent practice in amortized complexity, recursive memoization, and combinatorial search',
      'Systematic decomposition of interview patterns and production data structures',
    ],
    tags: ['Algorithms', 'Data Structures', 'Dynamic Programming', 'Graph Theory', 'Time Complexity'],
    metric: '400+',
    metricLabel: 'Problems Solved',
  },
  {
    id: 'hackathon-engineering',
    category: 'Technical Hackathons',
    title: 'Collaborative Hackathon Engineering & Rapid Prototyping',
    roleOrContext: 'Team & Individual Competitions',
    timeframe: '2023 – 2026',
    summary:
      'Active participant in high-intensity national technical competitions including Hack the Future 3.0, ISRO Hackathon, and Build With Bharat 2.0. Translating abstract problem statements into functional full-stack architectures and machine learning prototypes within 24–48 hour sprints.',
    highlights: [
      'Architected end-to-end full-stack and machine learning pipelines under competitive time limits',
      'Engineered rapid APIs, vector search pipelines, and responsive client dashboards',
      'Iterated collaboratively on UX design, technical presentations, and live sponsor demonstrations',
    ],
    tags: ['Rapid Prototyping', 'System Architecture', 'Full-Stack', 'Team Collaboration'],
    metric: '3+',
    metricLabel: 'Major Hackathons',
  },
  {
    id: 'applied-ai-labs',
    category: 'Applied AI & ML',
    title: 'Self-Directed Machine Learning & LLM Systems Exploration',
    roleOrContext: 'Applied Engineering & Independent R&D',
    timeframe: '2024 – Present',
    summary:
      'Hands-on technical exploration of modern AI representations, Retrieval-Augmented Generation (RAG), computer vision pipelines, and transformer workflows. Completed rigorous curricula from IBM, Cisco, and industry simulations from Deloitte and BCG.',
    highlights: [
      'Implemented vector search, contextual embeddings, and prompt orchestration workflows',
      'Experimented with computer vision architectures, image processing, and NLP tokenizers',
      'Validated enterprise industry standards through software engineering and data analytics simulations',
    ],
    tags: ['Machine Learning', 'Computer Vision', 'NLP', 'Vector Embeddings', 'AI Engineering'],
    metric: '10+',
    metricLabel: 'Certifications & Labs',
  },
  {
    id: 'science-innovation',
    category: 'Academic & Science',
    title: 'District Science Innovation & Applied Physics Demonstration',
    roleOrContext: 'Science Model Exhibition',
    timeframe: 'District Level Competition',
    summary:
      'Engineered working demonstrator models representing real-world physical and computational principles, earning First Prize at the district science competition through rigorous demonstration and analytical defense.',
    highlights: [
      'Designed and built functional working hardware/science demonstration apparatus',
      'Awarded First Prize by district academic evaluation panel for ingenuity and clarity',
      'Presented technical concepts to diverse student and faculty audiences',
    ],
    tags: ['Applied Physics', 'Hardware Prototyping', 'First Prize', 'Technical Defense'],
    metric: '1st',
    metricLabel: 'District Award',
  },
];
