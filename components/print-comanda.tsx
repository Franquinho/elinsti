"use client"

import type React from "react"
import { forwardRef } from "react"

// Interfaz actualizada para coincidir con la estructura de la API
interface Comanda {
  id: number
  nombre_cliente?: string
  items: Array<{
    cantidad: number
    precio_unitario: number
    producto: {
      nombre: string
    }
  }>
  total: number
  created_at: string
}

interface PrintComandaProps {
  comanda: Comanda
}

export const PrintComanda = forwardRef<HTMLDivElement, PrintComandaProps>(({ comanda }, ref) => {
  if (!comanda) return null

  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-xs hidden print:block">
      <h2 className="text-center font-bold text-lg mb-2">EL INSTI</h2>
      <p className="text-center text-xs">Comanda #{comanda.id}</p>
      <p className="text-center text-xs">{new Date(comanda.created_at).toLocaleString()}</p>
      {comanda.nombre_cliente && <p className="mt-2">Cliente: {comanda.nombre_cliente}</p>}
      <hr className="border-t border-dashed border-black my-2" />
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Cant.</th>
            <th className="text-left">Producto</th>
            <th className="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {/* Lógica de renderizado actualizada */}
          {comanda.items.map((item, index) => (
            <tr key={index}>
              <td>{item.cantidad}</td>
              <td>{item.producto.nombre}</td>
              <td className="text-right">${(item.cantidad * item.precio_unitario).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="border-t border-dashed border-black my-2" />
      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>${comanda.total.toLocaleString()}</span>
      </div>
      <p className="text-center mt-4">¡Gracias por tu visita!</p>
    </div>
  )
})

PrintComanda.displayName = "PrintComanda"
