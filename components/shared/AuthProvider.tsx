// components/AuthProvider.tsx
"use client"

import { useEffect } from "react"
import { signInAnonymously, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth)
      }
    })
    return () => unsubscribe()
  }, [])

  return <>{children}</>
}
