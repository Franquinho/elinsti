"use client"

import { localDB } from "./database"

export class DataSeeder {
  static async seedInitialData() {
    try {
      await localDB.init()

      // Verificar si ya hay datos
      const usuarios = await localDB.getAll("usuarios")
      if (usuarios.length > 0) {
        console.log("Datos ya inicializados")
        return
      }

      // Seed usuarios
      await localDB.add("usuarios", {
        nombre: "Admin El Insti",
        email: "admin@elinsti.com",
        clave_hash: "123456", // En producción usar hash real
        rol: "administrador",
        activo: true,
      })

      await localDB.add("usuarios", {
        nombre: "Cajero Principal",
        email: "caja@elinsti.com",
        clave_hash: "123456",
        rol: "caja",
        activo: true,
      })

      await localDB.add("usuarios", {
        nombre: "Vendedor 1",
        email: "venta1@elinsti.com",
        clave_hash: "123456",
        rol: "venta",
        activo: true,
      })

      // Seed productos
      const productos = [
        { nombre: "Cerveza Artesanal", precio: 2500, emoji: "🍺", activo: true },
        { nombre: "Vino Tinto", precio: 3500, emoji: "🍷", activo: true },
        { nombre: "Empanadas", precio: 1200, emoji: "🥟", activo: true },
        { nombre: "Tabla de Quesos", precio: 4500, emoji: "🧀", activo: true },
        { nombre: "Café Especial", precio: 1800, emoji: "☕", activo: true },
        { nombre: "Agua Mineral", precio: 800, emoji: "💧", activo: true },
      ]

      for (const producto of productos) {
        await localDB.add("productos", producto)
      }

      // Seed eventos
      await localDB.add("eventos", {
        nombre: "Noche Bohemia - Enero 2024",
        fecha: "2024-01-15",
        estado: "activo",
      })

      await localDB.add("eventos", {
        nombre: "Concierto Acústico",
        fecha: "2024-01-20",
        estado: "activo",
      })

      console.log("✅ Datos iniciales cargados correctamente")
    } catch (error) {
      console.error("❌ Error al cargar datos iniciales:", error)
    }
  }

  static async resetDatabase() {
    try {
      // Limpiar IndexedDB
      const stores = ["usuarios", "productos", "comandas", "eventos", "caja"]
      await localDB.init()

      for (const store of stores) {
        const items = await localDB.getAll(store)
        for (const item of items) {
          await localDB.delete(store, item.id)
        }
      }

      // Limpiar localStorage
      localStorage.clear()

      // Recargar datos iniciales
      await this.seedInitialData()

      console.log("✅ Base de datos reiniciada")
    } catch (error) {
      console.error("❌ Error al reiniciar base de datos:", error)
    }
  }
}
