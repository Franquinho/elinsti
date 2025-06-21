"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Printer, Download } from "lucide-react"

interface Comanda {
  id: number
  usuario_nombre: string
  nombre_cliente?: string
  productos: Array<{
    nombre: string
    cantidad: number
    precio: number
    emoji: string
  }>
  total: number
  created_at: string
}

interface PrintComandaProps {
  comanda: Comanda
}

export function PrintComanda({ comanda }: PrintComandaProps) {
  const printComanda = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comanda #${comanda.id} - El INSTI</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              background: linear-gradient(45deg, #ec4899, #f97316);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .comanda-info {
              margin-bottom: 15px;
              font-size: 12px;
            }
            .productos {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
              margin: 15px 0;
            }
            .producto {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .total {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin-top: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🎵 EL INSTI 🎵</div>
            <div>Música & Eventos</div>
          </div>
          
          <div class="comanda-info">
            <div><strong>Comanda:</strong> #${comanda.id}</div>
            <div><strong>Cliente:</strong> ${comanda.nombre_cliente || "N/A"}</div>
            <div><strong>Vendedor:</strong> ${comanda.usuario_nombre}</div>
            <div><strong>Fecha:</strong> ${new Date(comanda.created_at).toLocaleString()}</div>
          </div>
          
          <div class="productos">
            ${comanda.productos
              .map(
                (producto) => `
              <div class="producto">
                <span>${producto.emoji} ${producto.cantidad}x ${producto.nombre}</span>
                <span>$${(producto.precio * producto.cantidad).toLocaleString()}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="total">
            TOTAL: $${comanda.total.toLocaleString()}
          </div>
          
          <div class="footer">
            <div>¡Gracias por tu visita!</div>
            <div>🎶 Volvé pronto 🎶</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const downloadPDF = () => {
    // Simulación de descarga PDF
    alert("Función de descarga PDF en desarrollo")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
          <Printer className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Imprimir Comanda #{comanda.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-2">Vista previa:</h4>
            <div className="text-sm space-y-1">
              <p>
                <strong>Cliente:</strong> {comanda.nombre_cliente || "N/A"}
              </p>
              <p>
                <strong>Total:</strong> ${comanda.total.toLocaleString()}
              </p>
              <p>
                <strong>Productos:</strong> {comanda.productos.length} items
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={printComanda} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={downloadPDF} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
