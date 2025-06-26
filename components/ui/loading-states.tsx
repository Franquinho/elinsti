import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { LoadingSpinner } from './animations';

// Estados de carga
interface LoadingStateProps {
  children: React.ReactNode;
  isLoading: boolean;
  className?: string;
  fallback?: React.ReactNode;
}

export function LoadingState({ 
  children, 
  isLoading, 
  className,
  fallback 
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        {fallback || (
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

// Skeleton loader
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, width = "w-full", height = "h-4" }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        "bg-gray-200 rounded animate-pulse",
        width,
        height,
        className
      )}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

// Skeleton para tarjetas
interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export function CardSkeleton({ className, lines = 3 }: CardSkeletonProps) {
  return (
    <div className={cn("p-6 bg-white rounded-lg border", className)}>
      <Skeleton className="w-3/4 h-6 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="w-full h-4 mb-2" />
      ))}
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}

// Skeleton para tablas
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="bg-white border rounded-lg">
        {/* Header */}
        <div className="border-b bg-gray-50 px-6 py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="w-24 h-4" />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="w-20 h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para listas
interface ListSkeletonProps {
  items?: number;
  className?: string;
}

export function ListSkeleton({ items = 5, className }: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Estado de error
interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("text-center p-8", className)}>
      <div className="mx-auto w-16 h-16 mb-4 text-red-500">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Algo salió mal
      </h3>
      {error && (
        <p className="text-gray-600 mb-4">{error}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}

// Estado vacío
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title = "No hay datos", 
  description = "No se encontraron elementos para mostrar",
  icon,
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("text-center p-8", className)}>
      {icon && (
        <div className="mx-auto w-16 h-16 mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}

// Estado de carga con progreso
interface ProgressLoadingProps {
  progress: number;
  message?: string;
  className?: string;
}

export function ProgressLoading({ progress, message, className }: ProgressLoadingProps) {
  return (
    <div className={cn("p-6", className)}>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{message || "Procesando..."}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

// Estado de carga con pulso
interface PulseLoadingProps {
  message?: string;
  className?: string;
}

export function PulseLoading({ message, className }: PulseLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center">
        <motion.div
          className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-4"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {message && (
          <p className="text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}

// Estado de carga con puntos
interface DotsLoadingProps {
  message?: string;
  className?: string;
}

export function DotsLoading({ message, className }: DotsLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full mx-1"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        {message && (
          <p className="text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
} 