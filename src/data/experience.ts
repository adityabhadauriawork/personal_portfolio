export interface InternshipEvidence {
  id: string;
  type: 'offer-letter' | 'completion-letter' | 'recommendation-letter';
  label: string;
  expectedFile: string;
  assetPath: string;
  verificationNote: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  badge?: string;
  summary: string;
  contributions: string[];
  skills: string[];
  evidence: InternshipEvidence[];
}

export const experiencesData: ExperienceItem[] = [
  {
    id: 'flyrank-ai',
    role: 'Machine Learning Engineering Intern',
    organization: 'FlyRank AI',
    location: 'Remote',
    period: 'Internship',
    badge: 'Search & Relevance',
    summary:
      'Contributed to semantic search pipelines, dense vector retrieval, and document ranking workflows.',
    contributions: [
      'Contributed to semantic search pipelines leveraging dense vector embeddings and cosine similarity ranking.',
      'Analyzed user query intent distributions and evaluated ranking metrics (NDCG, MRR) against baseline retrieval models.',
      'Assisted in data preprocessing, embedding generation, and feature extraction to enhance document discoverability.',
    ],
    skills: ['Python', 'Vector Embeddings', 'Semantic Search', 'Information Retrieval', 'Scikit-Learn', 'PyTorch'],
    evidence: [
      {
        id: 'flyrank-offer',
        type: 'offer-letter',
        label: 'Offer Letter',
        expectedFile: 'public/assets/portfolio/experience/flyrank-ai/offer-letter.jpg',
        assetPath: '/assets/portfolio/experience/flyrank-ai/offer-letter.jpg',
        verificationNote: 'Official appointment letter for Machine Learning Engineering Internship at FlyRank AI.',
      },
      {
        id: 'flyrank-completion',
        type: 'completion-letter',
        label: 'Completion Letter',
        expectedFile: 'public/assets/portfolio/experience/flyrank-ai/completion-letter.jpg',
        assetPath: '/assets/portfolio/experience/flyrank-ai/completion-letter.jpg',
        verificationNote: 'Verified completion and performance document issued by FlyRank AI leadership.',
      },
      {
        id: 'flyrank-recommendation',
        type: 'recommendation-letter',
        label: 'Letter of Recommendation',
        expectedFile: 'public/assets/portfolio/experience/flyrank-ai/recommendation-letter.jpg',
        assetPath: '/assets/portfolio/experience/flyrank-ai/recommendation-letter.jpg',
        verificationNote: 'Official Letter of Recommendation highlighting Machine Learning contributions and problem solving.',
      },
    ],
  },
  {
    id: 'prodigy-infotech',
    role: 'Software Development Intern',
    organization: 'Prodigy InfoTech',
    location: 'Remote',
    period: 'Internship',
    badge: 'Frontend & Full-Stack',
    summary:
      'Developed responsive web interfaces, engineered modular component architectures, and integrated RESTful API endpoints.',
    contributions: [
      'Engineered modular, reusable UI components using TypeScript, React, and modern CSS layout systems.',
      'Implemented client-side state management and consumed RESTful API endpoints with structured error handling.',
      'Maintained cross-browser consistency, responsive design, and version control workflows using Git.',
    ],
    skills: ['TypeScript', 'React', 'JavaScript (ES6+)', 'REST APIs', 'HTML5/CSS3', 'Git'],
    evidence: [
      {
        id: 'prodigy-offer',
        type: 'offer-letter',
        label: 'Offer Letter',
        expectedFile: 'public/assets/portfolio/experience/prodigy-infotech/offer-letter.jpg',
        assetPath: '/assets/portfolio/experience/prodigy-infotech/offer-letter.jpg',
        verificationNote: 'Official appointment letter for Software Development Internship at Prodigy InfoTech.',
      },
      {
        id: 'prodigy-completion',
        type: 'completion-letter',
        label: 'Completion Letter',
        expectedFile: 'public/assets/portfolio/experience/prodigy-infotech/completion-letter.jpg',
        assetPath: '/assets/portfolio/experience/prodigy-infotech/completion-letter.jpg',
        verificationNote: 'Verified internship completion certificate issued by Prodigy InfoTech.',
      },
    ],
  },
];
