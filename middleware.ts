import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders, corsConfig } from '@/lib/security';

export function middleware(request: NextRequest) {
  // Obtener el origen de la request
  const origin = request.headers.get('origin') || '';
  
  // Verificar si el origen está permitido
  const isAllowedOrigin = corsConfig.origin.includes(origin) || 
                         corsConfig.origin.includes('*') ||
                         !origin; // Permitir requests sin origen (mismo origen)

  // Crear la respuesta
  const response = NextResponse.next();

  // Aplicar headers de seguridad
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Aplicar headers CORS si el origen está permitido
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());
    
    if (corsConfig.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // Manejar preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 