"use client"
import { useEffect, useState } from "react"
import { EventType } from "@/types/enums"

export interface ToastProps {
  eventType: EventType
  message: string
  visible: boolean
  onClose: () => void
}

export default function Toast({
  eventType,
  message,
  visible,
  onClose,
}: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!visible) return
    const showTimer = setTimeout(() => setShow(true), 0)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(timer)
    }
  }, [visible, onClose])

  return (
    <div
      className={`toast btn-${eventType} ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {message}
    </div>
  )
}
