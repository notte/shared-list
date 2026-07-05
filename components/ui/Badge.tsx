import { User } from "@/features/user/schemas/user.schema"
import { getContrastColor } from "@/lib/utils"

export interface BadgeProps {
  user: User
}

export default function Badge({ user }: BadgeProps) {
  const textColor = getContrastColor(user.color)

  return (
    <div
      className={
        "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold select-none"
      }
      style={{ backgroundColor: user.color, color: textColor }}
    >
      {user.userName[0]}
    </div>
  )
}
