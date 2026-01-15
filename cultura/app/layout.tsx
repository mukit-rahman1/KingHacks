import type { Metadata } from "next"
import { Geist, Geist_Mono, Fraunces } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/ui/navbar"

const bodyFont = Geist({
  subsets: ["latin"],
  variable: "--font-body",
})

const monoFont = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const headerFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-header",
})

export const metadata: Metadata = {
  title: "Cultura",
  description: "Discover and share cultural events in Kingston.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${monoFont.variable} ${headerFont.variable}`}
    >
      <body className="font-body antialiased bg-background text-foreground">
        {/* Top Navigation */}
        <Navbar />

        {/* Page content */}
        <main className="pt-0">
          {children}
        </main>
      </body>
    </html>
  )
}
