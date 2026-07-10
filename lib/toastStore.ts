import { ToastProps } from "@/components/ui/Toast"
import { EventType } from "@/types/enums"
import { v4 as uuidv4 } from "uuid"

export interface IToastStore {
  subscribe: (fn: () => void) => () => void
  getSnapshot: () => ToastProps[]
  getServerSnapshot?: () => ToastProps[]
  add: (eventType: EventType, message: string) => void
  remove: (id: string) => void
}

const emptyArray: ToastProps[] = []

let toasts: ToastProps[] = []
let listeners: (() => void)[] = []

export const toastStore: IToastStore = {
  subscribe(fn) {
    listeners.push(fn)
    return () => {
      listeners = listeners.filter((currentFn) => currentFn !== fn)
    }
  },
  getSnapshot() {
    return toasts
  },
  getServerSnapshot() {
    return emptyArray // 伺服器端永遠是空的
  },
  add(eventType, message) {
    const isDuplicate = toasts.some(
      (item) => item.message === message && item.eventType === eventType,
    )
    if (isDuplicate) return
    const id = uuidv4()
    toasts = toasts.concat({ id, eventType, message })
    listeners.forEach((fn) => fn())
  },
  remove(id) {
    toasts = toasts.filter((item) => item.id !== id)
    listeners.forEach((fn) => fn())
  },
}
