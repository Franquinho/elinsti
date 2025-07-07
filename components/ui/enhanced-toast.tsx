"use client"

import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, Music, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'music' | 'loading'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  music: Music,
  loading: Loader2
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  music: 'bg-purple-50 border-purple-200 text-purple-800',
  loading: 'bg-gray-50 border-gray-200 text-gray-800'
}

const iconStyles = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  music: 'text-purple-600',
  loading: 'text-gray-600'
}

export function EnhancedToast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const Icon = toastIcons[type]
  const isAnimated = type === 'music' || type === 'loading'

  React.useEffect(() => {
    if (duration > 0 && type !== 'loading') {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, type, onClose])

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm transition-all duration-300 ease-in-out',
        toastStyles[type],
        'animate-in slide-in-from-right-full'
      )}
    >
      <Icon 
        className={cn(
          'w-5 h-5 mt-0.5 flex-shrink-0',
          iconStyles[type],
          isAnimated && 'animate-pulse'
        )} 
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm leading-tight">{title}</h4>
        {message && (
          <p className="text-sm mt-1 leading-relaxed opacity-90">{message}</p>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1"
        aria-label="Cerrar notificación"
      >
        <XCircle className="w-4 h-4" />
      </button>
      
      {duration > 0 && type !== 'loading' && (
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg transition-all duration-300 ease-linear"
             style={{ 
               width: '100%',
               animation: `shrink ${duration}ms linear forwards`
             }}
        />
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <EnhancedToast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
} 