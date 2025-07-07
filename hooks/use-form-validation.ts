import { useState, useCallback } from 'react'
import { z } from 'zod'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([])

  // Esquemas de validación comunes
  const schemas = {
    email: z.string()
      .email('Email inválido')
      .min(1, 'Email es requerido')
      .max(254, 'Email demasiado largo'),
    
    password: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(128, 'La contraseña es demasiado larga')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
    name: z.string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    
    price: z.number()
      .positive('El precio debe ser positivo')
      .max(999999.99, 'El precio es demasiado alto'),
    
    quantity: z.number()
      .int('La cantidad debe ser un número entero')
      .positive('La cantidad debe ser positiva')
      .max(999999, 'La cantidad es demasiado alta'),
    
    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido')
      .min(7, 'El teléfono debe tener al menos 7 dígitos')
      .max(20, 'El teléfono es demasiado largo'),
    
    required: z.string().min(1, 'Este campo es requerido'),
    
    optionalText: z.string().max(1000, 'El texto es demasiado largo').optional()
  }

  // Validar un campo específico
  const validateField = useCallback((field: string, value: any, schema: z.ZodTypeAny): ValidationError | null => {
    try {
      schema.parse(value)
      return null
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          field,
          message: error.errors[0].message
        }
      }
      return {
        field,
        message: 'Error de validación'
      }
    }
  }, [])

  // Validar formulario completo
  const validateForm = useCallback((data: any, schema: z.ZodObject<any>): ValidationResult => {
    try {
      schema.parse(data)
      setErrors([])
      return { isValid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        setErrors(validationErrors)
        return { isValid: false, errors: validationErrors }
      }
      return { isValid: false, errors: [{ field: 'general', message: 'Error de validación' }] }
    }
  }, [])

  // Obtener error de un campo específico
  const getFieldError = useCallback((fieldName: string): string | null => {
    const error = errors.find(err => err.field === fieldName)
    return error ? error.message : null
  }, [errors])

  // Limpiar errores
  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  // Limpiar error de un campo específico
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => prev.filter(err => err.field !== fieldName))
  }, [])

  // Esquemas predefinidos para formularios comunes
  const formSchemas = {
    login: z.object({
      email: schemas.email,
      password: schemas.password
    }),
    
    comanda: z.object({
      usuario_id: z.number().positive('ID de usuario inválido'),
      evento_id: z.number().positive('ID de evento inválido'),
      total: schemas.price,
      nombre_cliente: schemas.name,
      productos: z.array(z.object({
        id: z.number().positive('ID de producto inválido'),
        cantidad: schemas.quantity,
        precio: schemas.price
      })).min(1, 'Debe incluir al menos un producto')
    }),
    
    producto: z.object({
      nombre: schemas.required,
      precio: schemas.price,
      emoji: z.string().min(1, 'Emoji requerido')
    }),
    
    evento: z.object({
      nombre: schemas.required,
      descripcion: schemas.optionalText,
      fecha_inicio: z.string().min(1, 'Fecha de inicio requerida'),
      fecha_fin: z.string().min(1, 'Fecha de fin requerida'),
      ubicacion: schemas.optionalText,
      capacidad_maxima: z.number().positive('Capacidad debe ser positiva').optional(),
      precio_entrada: schemas.price.optional()
    })
  }

  return {
    errors,
    schemas,
    formSchemas,
    validateField,
    validateForm,
    getFieldError,
    clearErrors,
    clearFieldError
  }
} 