"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/auth"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { useFormValidation } from "@/hooks/use-form-validation"
import { z } from "zod"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido')
    .max(254, 'Email demasiado largo'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número')
})

export function LoginForm() {
  const { login } = useAuth()
  const { error, handleError, clearError } = useErrorHandler()
  const { validateForm, getFieldError, clearFieldError } = useFormValidation()
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Limpiar errores cuando cambian los campos
  useEffect(() => {
    if (formData.email && fieldErrors.email) {
      clearFieldError('email')
      setFieldErrors(prev => ({ ...prev, email: '' }))
    }
    if (formData.password && fieldErrors.password) {
      clearFieldError('password')
      setFieldErrors(prev => ({ ...prev, password: '' }))
    }
  }, [formData.email, formData.password, fieldErrors, clearFieldError])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    clearError()
    
    // Validación en tiempo real
    if (value.trim()) {
      const fieldSchema = field === 'email' ? loginSchema.shape.email : loginSchema.shape.password
      const validation = fieldSchema.safeParse(value)
      
      if (!validation.success) {
        setFieldErrors(prev => ({ 
          ...prev, 
          [field]: validation.error.errors[0].message 
        }))
      } else {
        setFieldErrors(prev => ({ ...prev, [field]: '' }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación del formulario completo
    const validation = validateForm(formData, loginSchema)
    if (!validation.isValid) {
      const errors: {[key: string]: string} = {}
      validation.errors.forEach(err => {
        errors[err.field] = err.message
      })
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    setLoading(true)
    clearError()
    setFieldErrors({})

    try {
      const success = await login(formData.email, formData.password)

      if (!success) {
        const errorInfo = handleError({
          status: 401,
          message: 'Credenciales incorrectas'
        })
        // El error se maneja automáticamente en el hook
      }
    } catch (err: any) {
      const errorInfo = handleError(err)
      // El error se maneja automáticamente en el hook
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  const isFormValid = formData.email.trim() && 
                     formData.password.trim() && 
                     !Object.values(fieldErrors).some(error => error) &&
                     !isSubmitting

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 relative">
            <Image src="/images/insti-logo.png" alt="El INSTI Logo" fill className="object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
            El INSTI
          </CardTitle>
          <CardDescription className="text-gray-700 font-medium">Sistema POS - Música & Eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-800 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={isSubmitting}
                className={cn(
                  "border-pink-200 focus:border-pink-500 focus:ring-pink-500 transition-colors",
                  fieldErrors.email && "border-red-300 focus:border-red-500 focus:ring-red-500",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <div id="email-error" className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.email}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-800 font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  className={cn(
                    "border-pink-200 focus:border-pink-500 focus:ring-pink-500 transition-colors pr-10",
                    fieldErrors.password && "border-red-300 focus:border-red-500 focus:ring-red-500",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <div id="password-error" className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.password}
                </div>
              )}
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">{error.message}</p>
                  {error.details && (
                    <p className="text-xs opacity-75 mt-1">{error.details}</p>
                  )}
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 hover:from-pink-600 hover:via-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </div>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold text-gray-800">
              <strong>Usuarios de prueba:</strong>
            </p>
            <p>Admin: admin@elinsti.com / Admin123!</p>
            <p>Caja: caja@elinsti.com / Caja123!</p>
            <p>Venta: venta1@elinsti.com / Venta123!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
