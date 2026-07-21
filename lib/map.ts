import { Variant, Size } from "@/types/enums"

export const colorMap: Record<Variant, string> = {
  [Variant.Default]: "text-[var(--btn-default-text)]",
  [Variant.Primary]: "text-[var(--btn-primary-text)]",
  [Variant.Success]: "text-[var(--btn-success-text)]",
  [Variant.Warning]: "text-[var(--btn-warning-text)]",
  [Variant.Danger]: "text-[var(--btn-danger-text)]",
  [Variant.Icon]: "text-[var(--btn-primary-text)]",
}

export const iconSizeMap: Record<Size, string> = {
  [Size.Small]: "size-4",
  [Size.Medium]: "size-6",
  [Size.Large]: "size-8",
}
