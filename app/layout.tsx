import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import ToastProvider from "@/components/shared/ToastProvider"
import "@/styles/globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Shared List",
  description: "A simple shared list application.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full m-0 p-0">
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
