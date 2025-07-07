import { useState, useCallback } from 'react'

export interface ErrorInfo {
  message: string
  type: 'error' | 'warning' | 'info'
  details?: string
  code?: number
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorInfo | null>(null)

  // Traducir errores de API a mensajes amigables
  const translateApiError = useCallback((status: number, message: string, details?: any): ErrorInfo => {
    switch (status) {
      case 400:
        return {
          message: 'Datos incorrectos. Por favor, verifica la información ingresada.',
          type: 'error',
          details: message,
          code: status
        }
      
      case 401:
        return {
          message: 'Credenciales incorrectas. Verifica tu email y contraseña.',
          type: 'error',
          details: message,
          code: status
        }
      
      case 403:
        return {
          message: 'No tienes permisos para realizar esta acción.',
          type: 'error',
          details: message,
          code: status
        }
      
      case 404:
        return {
          message: 'Recurso no encontrado. Intenta recargar la página.',
          type: 'error',
          details: message,
          code: status
        }
      
      case 429:
        return {
          message: 'Demasiadas peticiones. Espera un momento antes de intentar nuevamente.',
          type: 'warning',
          details: message,
          code: status
        }
      
      case 413:
        return {
          message: 'Datos demasiado grandes. Reduce la cantidad de información.',
          type: 'error',
          details: message,
          code: status
        }
      
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Error del servidor. Intenta nuevamente en unos minutos.',
          type: 'error',
          details: 'Error interno del servidor',
          code: status
        }
      
      default:
        return {
          message: 'Error inesperado. Contacta al administrador.',
          type: 'error',
          details: message,
          code: status
        }
    }
  })

  // Manejar errores de red
  const handleNetworkError = useCallback((error: any): ErrorInfo => {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        type: 'error',
        details: 'No se pudo conectar con el servidor'
      }
    }
    
    if (error.name === 'AbortError') {
      return {
        message: 'La petición fue cancelada.',
        type: 'warning',
        details: 'Operación interrumpida'
      }
    }
    
    return {
      message: 'Error de conexión inesperado.',
      type: 'error',
      details: error.message
    }
  }, [])

  // Manejar errores de validación
  const handleValidationError = useCallback((errors: string[]): ErrorInfo => {
    return {
      message: 'Por favor, corrige los siguientes errores:',
      type: 'error',
      details: errors.join(', ')
    }
  }, [])

  // Función principal para manejar errores
  const handleError = useCallback((error: any): ErrorInfo => {
    console.error('Error capturado:', error)
    
    // Si es una respuesta de API
    if (error.status && error.message) {
      return translateApiError(error.status, error.message, error.details)
    }
    
    // Si es un error de red
    if (error.name === 'TypeError' || error.name === 'AbortError') {
      return handleNetworkError(error)
    }
    
    // Si es un error de validación
    if (Array.isArray(error)) {
      return handleValidationError(error)
    }
    
    // Error genérico
    return {
      message: 'Ha ocurrido un error inesperado.',
      type: 'error',
      details: error.message || 'Error desconocido'
    }
  }, [translateApiError, handleNetworkError, handleValidationError])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Establecer error manualmente
  const setErrorManually = useCallback((errorInfo: ErrorInfo) => {
    setError(errorInfo)
  }, [])

  return {
    error,
    handleError,
    clearError,
    setErrorManually,
    translateApiError,
    handleNetworkError,
    handleValidationError
  }
} 