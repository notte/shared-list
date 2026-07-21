import { ToastProps } from "@/components/ui/Toast"
import { Variant } from "@/types/enums"
import { v4 as uuidv4 } from "uuid"

export interface IToastStore {
  subscribe: (fn: () => void) => () => void
  getSnapshot: () => ToastProps[]
  getServerSnapshot?: () => ToastProps[]
  add: (Variant: Variant, message: string) => void
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
  add(Variant, message) {
    const isDuplicate = toasts.some(
      (item) => item.message === message && item.Variant === Variant,
    )
    if (isDuplicate) return
    const id = uuidv4()
    toasts = toasts.concat({ id, Variant, message })
    listeners.forEach((fn) => fn())
  },
  remove(id) {
    toasts = toasts.filter((item) => item.id !== id)
    listeners.forEach((fn) => fn())
  },
}
