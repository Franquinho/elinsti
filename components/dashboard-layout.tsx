"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { offlineStorage } from "@/lib/offline-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { 
  Music, 
  Wifi, 
  WifiOff, 
  LogOut, 
  RefreshCw,
  AlertCircle
} from "lucide-react"
import Image from "next/image"
import EventSelector from "./event-selector"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  const [hasOfflineData, setHasOfflineData] = useState(false)

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="backdrop-blur border-b sticky top-0 z-50 shadow-sm bg-background/95 border-border">
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
                  <p className="text-sm text-muted-foreground">
                    {user?.nombre} - {user?.rol}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Indicador de conexión */}
              <div className="flex items-center gap-2">
                {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
                <span className="text-xs text-muted-foreground">{isOnline ? "En línea" : "Sin conexión"}</span>
              </div>

              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* Botón de sincronización */}
              {hasOfflineData && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={syncOfflineData}
                  className="text-xs border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sincronizar
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:text-pink-400 dark:hover:text-pink-300 dark:hover:bg-pink-950"
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
