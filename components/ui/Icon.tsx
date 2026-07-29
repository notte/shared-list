import { Variant, Size } from "@/types/enums"
import { colorMap, iconSizeMap } from "@/lib/theme"

export interface IconProps {
  variant: Variant
  size: Size
}

export default function Icon({
  children,
  variant,
  size,
}: IconProps & React.PropsWithChildren) {
  return (
    <div
      className={`${colorMap[variant]} ${iconSizeMap[size]} flex items-center justify-center`}
    >
      {children}
    </div>
  )
}
