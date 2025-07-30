'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
}

export function LoadingOverlay({ show, text = 'Cargando...' }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

interface LoadingCardProps {
  text?: string;
  className?: string;
}

export function LoadingCard({ text = 'Cargando...', className }: LoadingCardProps) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}