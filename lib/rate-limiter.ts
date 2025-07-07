import { NextRequest, NextResponse } from 'next/server'

// Store para rate limiting en memoria (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en ms
  maxRequests: number // Máximo número de requests
  message?: string // Mensaje de error personalizado
}

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimiter(request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    // Obtener pathname de forma segura
    let pathname = '/api/unknown'
    try {
      pathname = request.nextUrl?.pathname || '/api/unknown'
    } catch (error) {
      // En tests o casos donde nextUrl no está disponible
      pathname = '/api/unknown'
    }
    
    // Limpiar entradas expiradas
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
    
    const key = `${ip}:${pathname}`
    const current = rateLimitStore.get(key)
    
    if (!current) {
      // Primera request
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Permitir request
    }
    
    if (now > current.resetTime) {
      // Resetear contador
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Permitir request
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit excedido
      return NextResponse.json(
        {
          success: false,
          message: config.message || 'Too many requests, please try again later',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      )
    }
    
    // Incrementar contador
    current.count++
    rateLimitStore.set(key, current)
    
    return null // Permitir request
  }
}

// Configuraciones predefinidas
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5, // 5 intentos
  message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
})

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 20, // 20 requests
  message: 'Demasiadas peticiones. Intenta de nuevo en 1 minuto.'
})

export const sensitiveRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 10, // 10 requests
  message: 'Demasiadas peticiones a este endpoint. Intenta de nuevo en 1 minuto.'
}) 