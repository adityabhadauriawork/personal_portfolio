export interface EducationItem {
  id: string;
  institution: string;
  qualification: string;
  degree?: string;
  dates: string;
  year?: string;
  location: string;
  shortDescription: string;
  badge: string;
  avatarVariant: 'college' | 'highschool' | 'secondary';
  highlights: string[];
  footerMeta?: string;
}

export const educationData: EducationItem[] = [
  {
    id: 'psit-kanpur',
    institution: 'Pranveer Singh Institute of Technology (PSIT)',
    qualification: 'Bachelor of Technology (B.Tech)',
    degree: 'Computer Science & Engineering',
    dates: '2024 – 2028',
    location: 'Kanpur, India',
    shortDescription:
      'Rigorous engineering foundation in data structures, algorithms, operating systems, and AI/ML architectures.',
    badge: 'Undergraduate Degree',
    avatarVariant: 'college',
    footerMeta: 'PSIT CSE · ENROLLMENT 2024–2028',
    highlights: [
      'Core focus: Data Structures, Algorithms, Distributed Systems & Machine Learning',
      'Active participant in competitive programming and national hackathons',
      'Technical leadership and collaborative engineering project development',
    ],
  },
  {
    id: 'st-marys-xii',
    institution: "St. Mary's Inter College",
    qualification: 'Class XII (Senior Secondary)',
    dates: '2022',
    year: '2022',
    location: 'India',
    shortDescription:
      'Comprehensive study in Mathematics, Physics, Chemistry, and introductory Computer Science.',
    badge: 'Senior Secondary',
    avatarVariant: 'highschool',
    highlights: [
      'Advanced Mathematics and Analytical Sciences',
      'Early computational foundations and programming logic',
      'Distinction in scientific model competitions',
    ],
  },
  {
    id: 'st-marys-x',
    institution: "St. Mary's Inter College",
    qualification: 'Class X (Secondary School)',
    dates: '2020',
    year: '2020',
    location: 'India',
    shortDescription:
      'Foundational secondary education with distinction across science, mathematics, and analytical reasoning.',
    badge: 'Secondary Education',
    avatarVariant: 'secondary',
    highlights: [
      'Comprehensive foundations in natural sciences and mathematics',
      'Academic excellence and competitive problem solving',
    ],
  },
];
