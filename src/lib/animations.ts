import { Transition, Variants } from 'framer-motion';

/**
 * Fluid Real Estate OS - Spring Animation Primitives
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 17.2
 * Philosophy: "Digital Physicality" - Everything moves with mass and friction.
 */

/* ═══════════════════════════════════════════════════════════════════
   SPRING PHYSICS PRESETS
   ═══════════════════════════════════════════════════════════════════ */

export const springPresets = {
  // Quick, snappy interactions (buttons, toggles)
  snappy: {
    type: 'spring',
    mass: 0.5,
    stiffness: 400,
    damping: 25,
  } as Transition,

  // Standard UI movements (panels, cards entry)
  standard: {
    type: 'spring',
    mass: 1,
    stiffness: 300,
    damping: 30,
  } as Transition,

  // Playful, bouncy effects (notifications, success states)
  bouncy: {
    type: 'spring',
    mass: 0.8,
    stiffness: 350,
    damping: 15,
  } as Transition,

  // Smooth, gentle transitions (hero elements, large modals)
  gentle: {
    type: 'spring',
    mass: 1.2,
    stiffness: 250,
    damping: 35,
  } as Transition,

  // No bounce, just smooth deceleration (opacity fades)
  smooth: {
    type: 'tween',
    ease: 'circOut',
    duration: 0.3,
  } as Transition,
};

/* ═══════════════════════════════════════════════════════════════════
   COMMON VARIANTS
   ═══════════════════════════════════════════════════════════════════ */

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: springPresets.standard,
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(4px)',
    transition: { duration: 0.2 },
  },
};

export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springPresets.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// For stagger children lists
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Returns a custom transition with Fluid OS physics
 */
export const getFluidTransition = (
  preset: keyof typeof springPresets = 'standard',
  delay = 0
): Transition => ({
  ...springPresets[preset],
  delay,
});
