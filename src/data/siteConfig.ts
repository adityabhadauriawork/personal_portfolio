export interface SiteConfig {
  name: string;
  shortName: string;
  role: string;
  tagline: string;
  institution: string;
  graduationYear: number;
  location: string;
  email: string;
  socials: {
    linkedin: string;
    github: string;
    leetcode: string;
  };
  cvPath: string;
  verifiedUrls: {
    automind: string;
    githubProfile: string;
    linkedinProfile: string;
  };
}

export const siteConfig: SiteConfig = {
  name: 'Aditya Pratap Singh Bhadauria',
  shortName: 'Aditya',
  role: 'Software Engineer & AI/ML Systems Developer',
  tagline: 'Where ambitious ideas become intelligent experiences.',
  institution: 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
  graduationYear: 2028,
  location: 'Kanpur, India',
  email: 'adityabhadauriawork@gmail.com',
  socials: {
    linkedin: 'https://www.linkedin.com/in/aditya-pratap-singh-bhadauria/',
    github: 'https://github.com/adityabhadauriawork',
    leetcode: 'https://leetcode.com/u/aadi__bhadauria/',
  },
  cvPath: '/assets/cv/Aditya-Pratap-Singh-Bhadauria-CV.pdf',
  verifiedUrls: {
    automind: 'https://automind-enterprise.streamlit.app/',
    githubProfile: 'https://github.com/adityabhadauriawork',
    linkedinProfile: 'https://www.linkedin.com/in/aditya-pratap-singh-bhadauria/',
  },
};
