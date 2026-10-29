export interface SkillDomain {
  id: string;
  category: string;
  number: string;
  description: string;
  skills: string[];
}

export const skillDomainsData: SkillDomain[] = [
  {
    id: 'programming-languages',
    category: 'Programming Languages',
    number: '01',
    description: 'Languages for application development, algorithms, and data workflows.',
    skills: ['Python', 'C++', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    id: 'machine-learning-ai',
    category: 'Machine Learning & AI',
    number: '02',
    description: 'Model development, representation learning, retrieval, and evaluation.',
    skills: ['Scikit-learn', 'PyTorch', 'Vector Embeddings', 'Semantic Search', 'RAG Orchestration', 'Model Evaluation (NDCG/MRR)'],
  },
  {
    id: 'data-engineering-analytics',
    category: 'Data Engineering & Analytics',
    number: '03',
    description: 'Preparing data pipelines and extracting reliable analytical insight.',
    skills: ['Pandas', 'NumPy', 'ETL Workflows', 'Data Transformation', 'Time-Series Forecasting', 'EDA & Profiling'],
  },
  {
    id: 'backend-apis',
    category: 'Backend & APIs',
    number: '04',
    description: 'Building reliable services, API contracts, and asynchronous workflows.',
    skills: ['FastAPI', 'Node.js', 'Express', 'RESTful APIs', 'Redis', 'Rate Limiting & Caching'],
  },
  {
    id: 'frontend-creative',
    category: 'Frontend & Creative Engineering',
    number: '05',
    description: 'Creating responsive interfaces, interactive systems, and 3D experiences.',
    skills: ['React', 'Three.js / WebGL', 'TypeScript', 'GSAP', 'CSS Modules / Modern CSS'],
  },
  {
    id: 'databases-storage',
    category: 'Databases & Storage',
    number: '06',
    description: 'Structured storage, querying, caching, and persistent application data.',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'In-Memory Caching'],
  },
  {
    id: 'cloud-devops-tools',
    category: 'Cloud, DevOps & Tools',
    number: '07',
    description: 'Version control, reproducible environments, and development workflows.',
    skills: ['Git', 'GitHub Actions', 'Docker', 'Linux', 'Vite / Tooling'],
  },
  {
    id: 'core-computer-science',
    category: 'Core Computer Science',
    number: '08',
    description: 'Foundations in algorithms, systems, and computational design.',
    skills: [
      'Data Structures & Algorithms',
      'Object-Oriented Programming (OOP)',
      'Database Management Systems (DBMS)',
      'Operating Systems',
      'Computer Networks',
    ],
  },
];
