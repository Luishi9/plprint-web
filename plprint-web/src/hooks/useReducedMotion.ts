import { useReducedMotion } from 'framer-motion';

export function useReducedMotionPreference(): boolean {
  return useReducedMotion() ?? false;
}
