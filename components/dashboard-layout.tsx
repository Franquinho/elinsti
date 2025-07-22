"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut, Wifi, WifiOff, Music, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { offlineStorage } from "@/lib/offline-storage"
import Image from "next/image"
import EventSelector from "@/components/event-selector";

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  const [hasOfflineData, setHasOfflineData] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setIsOnline(navigator.onLine)
    
    // Verificar datos offline de forma asíncrona
    const checkOfflineData = async () => {
      try {
        const hasData = await offlineStorage.hasOfflineData()
        setHasOfflineData(hasData)
      } catch (error) {
        console.error('Error verificando datos offline:', error)
        setHasOfflineData(false)
      }
    }
    
    checkOfflineData()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const syncOfflineData = async () => {
    const success = await offlineStorage.syncWithServer()
    if (success) {
      setHasOfflineData(false)
    }
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900"
          : "bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50"
      }`}
    >
      {/* Header */}
      <header
        className={`backdrop-blur border-b sticky top-0 z-50 shadow-sm transition-all duration-500 ${
          darkMode ? "bg-gray-900/95 border-purple-800" : "bg-white/95 border-pink-200"
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 relative">
                <Image src="/images/insti-logo.png" alt="El INSTI Logo" fill className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <div className="flex items-center gap-2">
                  <Music className="w-3 h-3 text-pink-500" />
                  <p className="text-sm text-gray-600">
                    {user?.nombre} - {user?.rol}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Indicador de conexión */}
              <div className="flex items-center gap-2">
                {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
                <span className="text-xs text-gray-600">{isOnline ? "En línea" : "Sin conexión"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>

              {/* Botón de sincronización */}
              {hasOfflineData && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={syncOfflineData}
                  className="text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  Sincronizar
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-4">
        <EventSelector />
      </div>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
