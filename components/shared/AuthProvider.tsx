"use client"

import { useEffect } from "react"
import { signInAnonymously, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase.client"
import { usePathname } from "next/navigation"
import { getUserData } from "@/services/storage/user.client"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  useEffect(() => {
    const userData = getUserData()
    if (isLandingPage && userData?.userId) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth)
      }
    })
    return () => unsubscribe()
  }, [isLandingPage])

  return <>{children}</>
}
