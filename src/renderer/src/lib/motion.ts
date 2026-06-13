import type { Variants } from "framer-motion";

const ease = [0.22, 0.61, 0.36, 1] as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

/** Surfaces settle in with a faint upward spring + scale — modern, tactile. */
export const surfaceIn: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 32, mass: 0.7 },
  },
  exit: { opacity: 0, y: -6, scale: 0.99, transition: { duration: 0.12 } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.028, delayChildren: 0.02 },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 520, damping: 34 },
  },
};
