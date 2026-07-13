import Icon from "@/components/ui/Icon"
import {
  HomeIcon,
  PlusCircleIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/solid"
import { ButtonAction, EventType, Size } from "@/types/enums"
import Button from "@/components/ui/Button"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center py-16 h-16 bg-background">
        <div className="flex items-center gap-4 p-16">
          <Button
            variant={EventType.Icon}
            disabled={false}
            action={ButtonAction.Navigate}
          >
            <Icon eventType={EventType.Primary} size={Size.Large}>
              <HomeIcon />
            </Icon>
          </Button>
        </div>
        <h1 className="text-5xl font-bold text-clay text-center line-clamp-1">
          Share List
        </h1>
        <div className="flex items-center gap-4 p-16">
          <Button
            variant={EventType.Icon}
            disabled={false}
            action={ButtonAction.Navigate}
          >
            <Icon eventType={EventType.Primary} size={Size.Large}>
              <Cog8ToothIcon />
            </Icon>
          </Button>
          <Button
            variant={EventType.Icon}
            disabled={false}
            action={ButtonAction.Navigate}
          >
            <Icon eventType={EventType.Primary} size={Size.Large}>
              <PlusCircleIcon />
            </Icon>
          </Button>
        </div>
      </nav>
      <div className="flex-1 p-4 mt-32 h-[calc(100vh-8rem)] flex justify-center items-center flex-col">
        {children}
      </div>
    </div>
  )
}
