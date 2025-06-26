import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Animaciones de entrada
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideInFromTop = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInFromBottom = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.4, ease: "easeOut" }
};

// Animaciones de escala
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: "easeOut" }
};

export const scaleInWithBounce = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { 
    duration: 0.5, 
    ease: [0.175, 0.885, 0.32, 1.275] // Bounce ease
  }
};

// Animaciones de lista
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const listItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

// Componentes de animación reutilizables
interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  animation?: any;
  delay?: number;
}

export function AnimatedContainer({ 
  children, 
  className, 
  animation = fadeIn,
  delay = 0 
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{ ...animation.transition, delay }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      variants={listItem}
    >
      {children}
    </motion.div>
  );
}

// Animaciones de hover
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 }
};

export const hoverLift = {
  whileHover: { 
    y: -4,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  whileTap: { y: 0 },
  transition: { duration: 0.2 }
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
  },
  transition: { duration: 0.2 }
};

// Animaciones de carga
export const loadingPulse = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const loadingSpin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Componente de carga animada
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={cn(
        'border-2 border-gray-300 border-t-blue-600 rounded-full',
        sizeClasses[size],
        className
      )}
      animate={loadingSpin.animate}
    />
  );
}

// Animación de transición de página
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 }
};

// Animación de notificación
export const notificationAnimation = {
  initial: { opacity: 0, y: -50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.9 },
  transition: { 
    duration: 0.4,
    ease: [0.175, 0.885, 0.32, 1.275]
  }
};

// Animación de modal
export const modalAnimation = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
  transition: { 
    duration: 0.3,
    ease: "easeOut"
  }
};

// Animación de overlay
export const overlayAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

// Hook para animaciones de scroll
export const useScrollAnimation = () => {
  return {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };
};

// Animación de contador
export const counterAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { 
    duration: 0.5,
    ease: [0.175, 0.885, 0.32, 1.275]
  }
};

// Animación de progreso
export const progressAnimation = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 1, ease: "easeOut" }
};

// Componente de animación de entrada con scroll
interface ScrollAnimatedProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollAnimated({ children, className, delay = 0 }: ScrollAnimatedProps) {
  const scrollAnimation = useScrollAnimation();
  
  return (
    <motion.div
      className={className}
      initial={scrollAnimation.initial}
      whileInView={scrollAnimation.whileInView}
      viewport={scrollAnimation.viewport}
      transition={{ ...scrollAnimation.transition, delay }}
    >
      {children}
    </motion.div>
  );
}

// Animación de tarjeta con hover
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'scale' | 'lift' | 'glow';
}

export function AnimatedCard({ 
  children, 
  className, 
  hoverEffect = 'lift' 
}: AnimatedCardProps) {
  const hoverAnimations = {
    scale: hoverScale,
    lift: hoverLift,
    glow: hoverGlow
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hoverAnimations[hoverEffect].whileHover}
      whileTap={hoverAnimations[hoverEffect].whileTap}
    >
      {children}
    </motion.div>
  );
}

// Animación de botón
interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
}

export function AnimatedButton({ 
  children, 
  className, 
  onClick, 
  disabled = false,
  variant = 'default'
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
}

// Animación de entrada secuencial
export const sequentialAnimation = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// Componente de animación secuencial
interface SequentialAnimatedProps {
  children: React.ReactNode;
  className?: string;
}

export function SequentialAnimated({ children, className }: SequentialAnimatedProps) {
  return (
    <motion.div
      className={className}
      variants={sequentialAnimation.container}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={sequentialAnimation.item}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
} 