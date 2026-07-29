"use client"
import { Variant } from "@/types/enums"
import { useEffect } from "react"
import { toastStore } from "@/lib/toastStore"

export interface ToastProps {
  id: string
  variant: Variant
  message: string
}

export default function Toast({ id, variant, message }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      toastStore.remove(id)
    }, 3000)
    return () => {
      clearTimeout(timer)
    }
  }, [id])

  return <div className={`toast toast-${variant}`}>{message}</div>
}
