"use client"
import Toast from "@/components/ui/Toast"
import { toastStore } from "@/lib/toastStore"
import { useSyncExternalStore } from "react"

export default function ToastProvider() {
  const snapshot = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot,
  )

  return (
    <div className="fixed top-0 left-0 z-50">
      {snapshot.map((item) => (
        <Toast
          key={item.id}
          Variant={item.Variant}
          message={item.message}
          id={item.id}
        />
      ))}
    </div>
  )
}
