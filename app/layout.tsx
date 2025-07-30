import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { EventProvider } from "@/lib/event-context"
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "El INSTI - Sistema POS",
  description: "Sistema de punto de venta para El INSTI, espacio de música y eventos",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <QueryProvider>
              <EventProvider>
                {children}
              </EventProvider>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
