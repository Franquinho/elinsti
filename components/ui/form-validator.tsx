"use client"

import React from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ValidationRule {
  test: (value: any) => boolean
  message: string
}

export interface FormFieldProps {
  label: string
  value: any
  onChange: (value: any) => void
  onBlur?: () => void
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  validation?: ValidationRule[]
  error?: string
  className?: string
  children?: React.ReactNode
}

export function FormField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  validation = [],
  error,
  className,
  children
}: FormFieldProps) {
  const [touched, setTouched] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(null)

  // Validación en tiempo real
  React.useEffect(() => {
    if (touched && validation.length > 0) {
      for (const rule of validation) {
        if (!rule.test(value)) {
          setValidationError(rule.message)
          return
        }
      }
      setValidationError(null)
    }
  }, [value, touched, validation])

  const handleChange = (newValue: any) => {
    onChange(newValue)
    if (touched) {
      setValidationError(null)
    }
  }

  const handleBlur = () => {
    setTouched(true)
    onBlur?.()
  }

  const hasError = error || validationError
  const isValid = touched && !hasError && value

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children || (
        <input
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
            hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
            isValid && "border-green-300 focus:border-green-500 focus:ring-green-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-invalid={!!hasError}
          aria-describedby={hasError ? `${label}-error` : undefined}
        />
      )}
      
      {hasError && (
        <div 
          id={`${label}-error`}
          className="flex items-center gap-2 text-red-600 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          {hasError}
        </div>
      )}
      
      {isValid && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          Campo válido
        </div>
      )}
    </div>
  )
}

// Reglas de validación predefinidas
export const validationRules = {
  required: (message = "Este campo es requerido"): ValidationRule => ({
    test: (value) => value !== null && value !== undefined && value !== "",
    message
  }),
  
  email: (message = "Email inválido"): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => String(value).length >= min,
    message: message || `Mínimo ${min} caracteres`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => String(value).length <= max,
    message: message || `Máximo ${max} caracteres`
  }),
  
  positiveNumber: (message = "Debe ser un número positivo"): ValidationRule => ({
    test: (value) => !isNaN(value) && Number(value) > 0,
    message
  }),
  
  price: (message = "Precio inválido"): ValidationRule => ({
    test: (value) => !isNaN(value) && Number(value) > 0 && Number(value) <= 999999.99,
    message
  }),
  
  quantity: (message = "Cantidad inválida"): ValidationRule => ({
    test: (value) => !isNaN(value) && Number(value) > 0 && Number(value) <= 999999,
    message
  }),
  
  name: (message = "Solo letras y espacios"): ValidationRule => ({
    test: (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value),
    message
  }),
  
  phone: (message = "Formato de teléfono inválido"): ValidationRule => ({
    test: (value) => /^\+?[\d\s\-\(\)]+$/.test(value) && value.length >= 7 && value.length <= 20,
    message
  })
} 