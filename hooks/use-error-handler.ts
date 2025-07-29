import { useToast } from './use-toast';

interface ErrorHandlerOptions {
  title?: string;
  defaultMessage?: string;
  duration?: number;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      title = "🔴 Error",
      defaultMessage = "Ocurrió un error inesperado",
      duration = 5000
    } = options;

    let errorMessage = defaultMessage;

    // Determinar el tipo de error y extraer el mensaje apropiado
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    } else if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      switch (status) {
        case 400:
          errorMessage = "Datos incorrectos. Verifica la información ingresada.";
          break;
        case 401:
          errorMessage = "No autorizado. Inicia sesión nuevamente.";
          break;
        case 403:
          errorMessage = "Acceso denegado. No tienes permisos para esta acción.";
          break;
        case 404:
          errorMessage = "Recurso no encontrado.";
          break;
        case 429:
          errorMessage = "Demasiadas peticiones. Espera un momento antes de intentar nuevamente.";
          break;
        case 500:
          errorMessage = "Error del servidor. Intenta nuevamente en unos minutos.";
          break;
        default:
          errorMessage = `Error ${status}: ${defaultMessage}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Mostrar el toast de error
    toast({
      title,
      description: errorMessage,
      duration,
      variant: "destructive"
    });

    // Log del error para debugging
    console.error('Error manejado:', {
      error,
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  };

  const handleNetworkError = (error: unknown) => {
    handleError(error, {
      title: "🌐 Error de Conexión",
      defaultMessage: "Error de conexión. Verifica tu conexión a internet.",
      duration: 7000
    });
  };

  const handleValidationError = (errors: string[]) => {
    toast({
      title: "⚠️ Datos Inválidos",
      description: errors.join(', '),
      duration: 5000,
      variant: "destructive"
    });
  };

  const handleApiError = (error: unknown, endpoint?: string) => {
    handleError(error, {
      title: "🔌 Error de API",
      defaultMessage: `Error en ${endpoint || 'la API'}. Intenta nuevamente.`,
      duration: 6000
    });
  };

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
    handleApiError
  };
}; 