import { EventType, Size } from "@/types/state"
import { colorMap, iconSizeMap } from "@/lib/map"

export interface IconProps {
  eventType: EventType
  size: Size
}

export default function Icon({
  children,
  eventType,
  size,
}: IconProps & React.PropsWithChildren) {
  return (
    <div
      className={`${colorMap[eventType]} ${iconSizeMap[size]} flex items-center justify-center`}
    >
      {children}
    </div>
  )
}
