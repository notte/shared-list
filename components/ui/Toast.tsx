"use client"
import { Variant } from "@/types/enums"
import { useEffect } from "react"
import { toastStore } from "@/lib/toastStore"

export interface ToastProps {
  id: string
  Variant: Variant
  message: string
}

export default function Toast({ id, Variant, message }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      toastStore.remove(id)
    }, 3000)
    return () => {
      clearTimeout(timer)
    }
  }, [id])

  return <div className={`toast toast-${Variant}`}>{message}</div>
}
