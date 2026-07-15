import Icon from "@/components/ui/Icon"
import { HomeIcon } from "@heroicons/react/24/solid"
import { ButtonAction, EventType, Size } from "@/types/enums"
import Button from "@/components/ui/Button"

export default async function NavLeft() {
  return (
    <div className="flex items-center gap-4 p-16">
      <Button
        variant={EventType.Icon}
        disabled={false}
        action={ButtonAction.Navigate}
        path={"/"}
      >
        <Icon eventType={EventType.Primary} size={Size.Large}>
          <HomeIcon />
        </Icon>
      </Button>
    </div>
  )
}
