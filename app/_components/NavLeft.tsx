"use client"
import Icon from "@/components/ui/Icon"
import { HomeIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid"
import { ButtonAction, Variant, Size } from "@/types/enums"
import Button from "@/components/ui/Button"
import { usePathname } from "next/navigation"

export default function NavLeft({ listId }: { listId: string }) {
  const pathname = usePathname()
  const isRoot = pathname === `/lists/${listId}`
  const path = isRoot ? "/" : `/lists/${listId}`

  return (
    <div className="flex items-center gap-4">
      <Button variant={Variant.Icon} action={ButtonAction.Navigate} path={path}>
        <Icon Variant={Variant.Primary} size={Size.Large}>
          {isRoot ? <HomeIcon /> : <ArrowUturnLeftIcon />}
        </Icon>
      </Button>
    </div>
  )
}
