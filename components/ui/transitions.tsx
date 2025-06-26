import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Transiciones suaves
export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1]
};

export const fastTransition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1]
};

export const slowTransition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1]
};

// Transiciones de página
export const pageTransitions = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: smoothTransition
};

// Transiciones de modal
export const modalTransitions = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: fastTransition
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: smoothTransition
  }
};

// Transiciones de lista
export const listTransitions = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: smoothTransition
  }
};

// Componente de transición de página
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={pageTransitions.initial}
      animate={pageTransitions.animate}
      exit={pageTransitions.exit}
      transition={pageTransitions.transition}
    >
      {children}
    </motion.div>
  );
}

// Componente de transición de modal
interface ModalTransitionProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
}

export function ModalTransition({ children, className, isOpen }: ModalTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn("fixed inset-0 z-50", className)}
          initial={modalTransitions.overlay.initial}
          animate={modalTransitions.overlay.animate}
          exit={modalTransitions.overlay.exit}
          transition={modalTransitions.overlay.transition}
        >
          <motion.div
            className="flex items-center justify-center min-h-screen p-4"
            initial={modalTransitions.content.initial}
            animate={modalTransitions.content.animate}
            exit={modalTransitions.content.exit}
            transition={modalTransitions.content.transition}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Componente de transición de lista
interface ListTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function ListTransition({ children, className }: ListTransitionProps) {
  return (
    <motion.div
      className={className}
      variants={listTransitions.container}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={listTransitions.item}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Transiciones de hover
export const hoverTransitions = {
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: fastTransition
  },
  lift: {
    whileHover: { 
      y: -4,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
    },
    whileTap: { y: 0 },
    transition: smoothTransition
  },
  glow: {
    whileHover: { 
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
    },
    transition: fastTransition
  }
};

// Componente con transición de hover
interface HoverTransitionProps {
  children: React.ReactNode;
  className?: string;
  effect?: 'scale' | 'lift' | 'glow';
}

export function HoverTransition({ 
  children, 
  className, 
  effect = 'lift' 
}: HoverTransitionProps) {
  return (
    <motion.div
      className={className}
      whileHover={hoverTransitions[effect].whileHover}
      whileTap={hoverTransitions[effect].whileTap}
      transition={hoverTransitions[effect].transition}
    >
      {children}
    </motion.div>
  );
}

// Transiciones de estado
export const stateTransitions = {
  loading: {
    initial: { opacity: 0.5 },
    animate: { opacity: 1 },
    transition: smoothTransition
  },
  error: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: fastTransition
  },
  success: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: smoothTransition
  }
};

// Componente de transición de estado
interface StateTransitionProps {
  children: React.ReactNode;
  className?: string;
  state: 'loading' | 'error' | 'success' | 'idle';
}

export function StateTransition({ children, className, state }: StateTransitionProps) {
  if (state === 'idle') return <div className={className}>{children}</div>;
  
  return (
    <motion.div
      className={className}
      initial={stateTransitions[state].initial}
      animate={stateTransitions[state].animate}
      transition={stateTransitions[state].transition}
    >
      {children}
    </motion.div>
  );
}

// Transiciones de entrada
export const entranceTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: smoothTransition
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: smoothTransition
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: smoothTransition
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: smoothTransition
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: smoothTransition
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: smoothTransition
  }
};

// Componente de transición de entrada
interface EntranceTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
}

export function EntranceTransition({ 
  children, 
  className, 
  type = 'fade',
  delay = 0 
}: EntranceTransitionProps) {
  const transition = {
    ...entranceTransitions[type],
    transition: {
      ...entranceTransitions[type].transition,
      delay
    }
  };

  return (
    <motion.div
      className={className}
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
    >
      {children}
    </motion.div>
  );
}

// Transiciones de notificación
export const notificationTransitions = {
  initial: { opacity: 0, y: -50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.9 },
  transition: {
    duration: 0.4,
    ease: [0.175, 0.885, 0.32, 1.275]
  }
};

// Componente de transición de notificación
interface NotificationTransitionProps {
  children: React.ReactNode;
  className?: string;
  isVisible: boolean;
}

export function NotificationTransition({ 
  children, 
  className, 
  isVisible 
}: NotificationTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={notificationTransitions.initial}
          animate={notificationTransitions.animate}
          exit={notificationTransitions.exit}
          transition={notificationTransitions.transition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Transiciones de progreso
export const progressTransitions = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 1, ease: "easeOut" }
};

// Componente de transición de progreso
interface ProgressTransitionProps {
  progress: number;
  className?: string;
}

export function ProgressTransition({ progress, className }: ProgressTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={progressTransitions.initial}
      animate={{ width: `${progress}%` }}
      transition={progressTransitions.transition}
    />
  );
}

// Transiciones de contador
export const counterTransitions = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { 
    duration: 0.5,
    ease: [0.175, 0.885, 0.32, 1.275]
  }
};

// Componente de transición de contador
interface CounterTransitionProps {
  children: React.ReactNode;
  className?: string;
  value: number;
}

export function CounterTransition({ children, className, value }: CounterTransitionProps) {
  return (
    <motion.div
      className={className}
      key={value}
      initial={counterTransitions.initial}
      animate={counterTransitions.animate}
      transition={counterTransitions.transition}
    >
      {children}
    </motion.div>
  );
} 