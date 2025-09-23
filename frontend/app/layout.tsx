import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { Web3Provider } from "@/lib/web3"
import { RoleProvider } from "@/lib/roles"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ClimaLink - Decentralized Climate Reporting Platform",
  description: "Earn rewards for sharing weather data. Community-validated climate reports on the blockchain.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <Web3Provider>
          <RoleProvider>
            <Suspense>
              {children}
              <Analytics />
            </Suspense>
          </RoleProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
