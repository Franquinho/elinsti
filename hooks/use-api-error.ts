'use client';

import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export function useApiError() {
  const { toast } = useToast();

  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);

    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as ApiError).message;
    }

    // Mensajes de error más amigables
    const friendlyMessages: Record<string, string> = {
      'Network request failed': 'Error de conexión. Por favor, verifica tu internet.',
      'Failed to fetch': 'No se pudo conectar con el servidor.',
      'Internal Server Error': 'Error en el servidor. Por favor, intenta más tarde.',
      'Unauthorized': 'No tienes permisos para realizar esta acción.',
      'Not Found': 'El recurso solicitado no fue encontrado.',
    };

    const displayMessage = friendlyMessages[errorMessage] || errorMessage;

    toast({
      title: '❌ Error',
      description: displayMessage,
      variant: 'destructive',
      duration: 5000,
    });

    return { error: true, message: displayMessage };
  }, [toast]);

  return { handleError };
}

// Hook para operaciones asíncronas con manejo de errores
export function useAsyncOperation<T extends (...args: any[]) => Promise<any>>() {
  const { handleError } = useApiError();
  const { toast } = useToast();

  const execute = useCallback(async (
    operation: T,
    options?: {
      successMessage?: string;
      errorContext?: string;
      onSuccess?: (data: Awaited<ReturnType<T>>) => void;
      onError?: (error: unknown) => void;
    }
  ): Promise<{ success: boolean; data?: Awaited<ReturnType<T>>; error?: string }> => {
    try {
      const result = await operation();
      
      if (options?.successMessage) {
        toast({
          title: '✅ Éxito',
          description: options.successMessage,
          duration: 3000,
        });
      }
      
      options?.onSuccess?.(result);
      
      return { success: true, data: result };
    } catch (error) {
      const { message } = handleError(error, options?.errorContext);
      options?.onError?.(error);
      
      return { success: false, error: message };
    }
  }, [handleError, toast]);

  return { execute };
}