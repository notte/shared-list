import { Variant, Size } from "@/types/enums"
import { colorMap, iconSizeMap } from "@/lib/map"

export interface IconProps {
  Variant: Variant
  size: Size
}

export default function Icon({
  children,
  Variant,
  size,
}: IconProps & React.PropsWithChildren) {
  return (
    <div
      className={`${colorMap[Variant]} ${iconSizeMap[size]} flex items-center justify-center`}
    >
      {children}
    </div>
  )
}
