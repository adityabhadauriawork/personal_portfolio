import { useExperience } from '../context/ExperienceContext';

/**
 * Hook to access and respect reduced-motion preferences,
 * allowing UI and 3D scenes to soften or disable intensive movements.
 */
export const useReducedMotion = () => {
  const { reducedMotion, setReducedMotion } = useExperience();

  return {
    reducedMotion,
    setReducedMotion,
  };
};
