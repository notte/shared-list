import { EventType, Size } from "@/types/enums"

export const colorMap: Record<EventType, string> = {
  [EventType.Default]: "text-[var(--btn-default-text)]",
  [EventType.Primary]: "text-[var(--btn-primary-text)]",
  [EventType.Success]: "text-[var(--btn-success-text)]",
  [EventType.Warning]: "text-[var(--btn-warning-text)]",
  [EventType.Danger]: "text-[var(--btn-danger-text)]",
  [EventType.Icon]: "text-[var(--btn-primary-text)]",
}

export const iconSizeMap: Record<Size, string> = {
  [Size.Small]: "size-4",
  [Size.Medium]: "size-6",
  [Size.Large]: "size-8",
}
