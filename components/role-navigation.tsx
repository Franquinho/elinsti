"use client"

import { useAuth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, CreditCard, Settings } from "lucide-react"

interface RoleNavigationProps {
  onSectionChange: (section: string) => void
  currentSection: string
}

export function RoleNavigation({ onSectionChange, currentSection }: RoleNavigationProps) {
  const { user } = useAuth()

  const getAvailableSections = () => {
    const sections = []

    // Todos pueden acceder a Ventas
    sections.push({
      id: "ventas",
      name: "Ventas",
      icon: ShoppingCart,
      description: "Crear comandas y gestionar ventas",
      gradient: "from-pink-500 to-orange-500",
    })

    // Caja y Admin pueden acceder a Caja
    if (user?.rol === "caja" || user?.rol === "administrador") {
      sections.push({
        id: "caja",
        name: "Caja",
        icon: CreditCard,
        description: "Aprobar comandas y gestionar pagos",
        gradient: "from-orange-500 to-yellow-500",
      })
    }

    // Solo Admin puede acceder a Administración
    if (user?.rol === "administrador") {
      sections.push({
        id: "admin",
        name: "Administración",
        icon: Settings,
        description: "Gestionar productos y ver estadísticas",
        gradient: "from-yellow-500 to-pink-500",
      })
    }

    return sections
  }

  const sections = getAvailableSections()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      {sections.map((section) => {
        const Icon = section.icon
        const isActive = currentSection === section.id

        return (
          <Card
            key={section.id}
            className={`cursor-pointer transition-all hover:shadow-xl transform hover:scale-105 ${
              isActive
                ? "ring-2 ring-pink-400 bg-gradient-to-br from-pink-50 to-orange-50 shadow-lg"
                : "hover:bg-gradient-to-br hover:from-pink-50/50 hover:to-orange-50/50"
            }`}
            onClick={() => onSectionChange(section.id)}
          >
            <CardContent className="p-6 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${section.gradient} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-lg">{section.name}</h3>
              <p className="text-sm text-gray-600">{section.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
