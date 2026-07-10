"use client"
import { EventType } from "@/types/enums"
import { useEffect } from "react"
import { toastStore } from "@/lib/toastStore"

export interface ToastProps {
  id: string
  eventType: EventType
  message: string
}

export default function Toast({ id, eventType, message }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      toastStore.remove(id)
    }, 10000)
    return () => {
      clearTimeout(timer)
    }
  }, [id])

  return <div className={`toast toast-${eventType}`}>{message}</div>
}
