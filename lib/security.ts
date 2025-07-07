import { z } from 'zod'

// Validaciones de seguridad
export const securityValidators = {
  // Validación de email con regex estricto
  email: z.string()
    .email('Email inválido')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido')
    .max(254, 'Email demasiado largo'),

  // Validación de password segura
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),

  // Validación de nombres
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),

  // Validación de precios
  price: z.number()
    .positive('El precio debe ser positivo')
    .max(999999.99, 'El precio es demasiado alto'),

  // Validación de cantidades
  quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser positiva')
    .max(999999, 'La cantidad es demasiado alta'),

  // Validación de fechas futuras
  futureDate: z.date()
    .refine((date) => date > new Date(), 'La fecha debe ser futura'),

  // Validación de IDs
  id: z.number()
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser positivo'),

  // Validación de texto con límites
  text: z.string()
    .min(1, 'El campo no puede estar vacío')
    .max(1000, 'El texto es demasiado largo'),

  // Validación de teléfono
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono es demasiado largo')
}

// Sanitización de inputs
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .replace(/\s+/g, ' ') // Normalizar espacios
}

// Validación de tamaño de payload
export function validatePayloadSize(payload: any, maxSizeKB: number = 100): boolean {
  const payloadSize = JSON.stringify(payload).length
  const maxSizeBytes = maxSizeKB * 1024
  return payloadSize <= maxSizeBytes
}

// Headers de seguridad
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// Configuración CORS segura
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 horas
}

// Validación de roles
export const userRoles = ['admin', 'caja', 'ventas'] as const
export type UserRole = typeof userRoles[number]

export function validateUserRole(role: string): role is UserRole {
  return userRoles.includes(role as UserRole)
}

// Validación de permisos por endpoint
export const endpointPermissions = {
  '/api/admin': ['admin'],
  '/api/comandas/create': ['admin', 'caja', 'ventas'],
  '/api/comandas/update-status': ['admin', 'caja'],
  '/api/productos/admin': ['admin'],
  '/api/eventos': ['admin', 'caja', 'ventas'],
  '/api/stats': ['admin', 'caja']
} as const

export function hasPermission(userRole: UserRole, endpoint: string): boolean {
  const requiredRoles = endpointPermissions[endpoint as keyof typeof endpointPermissions]
  return requiredRoles ? requiredRoles.includes(userRole) : true
} 