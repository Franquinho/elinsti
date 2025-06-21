"use client"

import { useState } from "react"
import { useAuth, AuthProvider } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleNavigation } from "@/components/role-navigation"
import { VentasSection } from "@/components/ventas-section"
import { CajaSection } from "@/components/caja-section"
import { AdminSection } from "@/components/admin-section"

function AppContent() {
  const { user, loading } = useAuth()
  const [currentSection, setCurrentSection] = useState("ventas")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">EI</span>
          </div>
          <p className="text-amber-700">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const getSectionTitle = () => {
    switch (currentSection) {
      case "ventas":
        return "Área de Ventas"
      case "caja":
        return "Área de Caja"
      case "admin":
        return "Administración"
      default:
        return "El INSTI POS"
    }
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "ventas":
        return <VentasSection />
      case "caja":
        return <CajaSection />
      case "admin":
        return <AdminSection />
      default:
        return <VentasSection />
    }
  }

  return (
    <DashboardLayout title={getSectionTitle()}>
      <RoleNavigation onSectionChange={setCurrentSection} currentSection={currentSection} />
      {renderCurrentSection()}
    </DashboardLayout>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
