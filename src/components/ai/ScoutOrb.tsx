'use client';

import { motion } from 'framer-motion';
import { springPresets } from '@/lib/animations';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export type ScoutOrbState = 'idle' | 'thinking' | 'success' | 'clarification';

interface ScoutOrbProps {
  state?: ScoutOrbState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════
   SIZE CONFIGURATIONS
   ═══════════════════════════════════════════════════════════════════ */

const sizeMap = {
  sm: 'w-6 h-6', // 24px
  md: 'w-8 h-8', // 32px (default)
  lg: 'w-12 h-12', // 48px
};

/* ═══════════════════════════════════════════════════════════════════
   STATE COLOR TOKENS
   ═══════════════════════════════════════════════════════════════════ */

const stateColors = {
  idle: {
    bg: 'rgba(0, 113, 227, 0.15)',
    border: 'rgba(0, 113, 227, 0.4)',
    glow: 'rgba(0, 113, 227, 0.3)',
  },
  thinking: {
    bg: 'rgba(0, 113, 227, 0.25)',
    border: '#0071e3',
    glow: 'rgba(0, 113, 227, 0.5)',
  },
  success: {
    bg: 'rgba(52, 199, 89, 0.25)',
    border: '#34c759',
    glow: 'rgba(52, 199, 89, 0.5)',
  },
  clarification: {
    bg: 'rgba(255, 159, 10, 0.25)',
    border: '#ff9f0a',
    glow: 'rgba(255, 159, 10, 0.5)',
  },
};

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════ */

const orbVariants = {
  idle: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  thinking: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  success: {
    scale: [1, 1.2, 1],
    opacity: 1,
    transition: {
      ...springPresets.bouncy,
      scale: {
        ...springPresets.bouncy,
        times: [0, 0.4, 1],
      },
    },
  },
  clarification: {
    scale: [1, 1.08, 1],
    rotate: [-2, 2, -2, 2, 0],
    opacity: [0.75, 1, 0.75],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const glowVariants = {
  idle: {
    opacity: [0.3, 0.5, 0.3],
    scale: [1, 1.1, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  thinking: {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.2, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  success: {
    opacity: [0.8, 0, 0],
    scale: [1, 1.5, 1.5],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
  clarification: {
    opacity: [0.4, 0.6, 0.4],
    scale: [1, 1.15, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export function ScoutOrb({
  state = 'idle',
  size = 'md',
  className,
}: ScoutOrbProps) {
  const colors = stateColors[state];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Ambient Glow Layer */}
      <motion.div
        className={cn('absolute inset-0 rounded-full blur-xl', sizeMap[size])}
        style={{
          backgroundColor: colors.glow,
        }}
        variants={glowVariants}
        animate={state}
        initial={false}
      />

      {/* Main Orb */}
      <motion.div
        className={cn(
          'relative rounded-full',
          'border-2',
          'backdrop-blur-sm',
          sizeMap[size]
        )}
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
        variants={orbVariants}
        animate={state}
        initial={false}
        transition={springPresets.standard}
      >
        {/* Glass-like Inner Shine */}
        <div
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)`,
          }}
        />

        {/* Core Light */}
        <motion.div
          className="absolute inset-[25%] rounded-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: state === 'thinking' ? [0.4, 0.8, 0.4] : 0.6,
          }}
          transition={{
            duration: 1.5,
            repeat: state === 'thinking' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
}
