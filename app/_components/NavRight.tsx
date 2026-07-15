"use client"

import Icon from "@/components/ui/Icon"
import { PlusCircleIcon, Cog8ToothIcon } from "@heroicons/react/24/solid"
import { ButtonAction, EventType, Size } from "@/types/enums"
import Button from "@/components/ui/Button"
import { List } from "@/features/lists/schemas/list.schema"
import { getUserId } from "@/services/storage/userStorage"
import { useEffect, useState } from "react"

export default function NavRight({
  listId,
  listData,
}: {
  listId: string
  listData: List
}) {
  const creatorId = listData.createdBy.userId
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    const userId = getUserId()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCreator(!!userId && userId === creatorId)
  }, [creatorId])

  return (
    <div className="flex items-center gap-4 p-16">
      {isCreator && (
        <Button
          variant={EventType.Icon}
          disabled={false}
          action={ButtonAction.Navigate}
          path={`/lists/${listId}/setting`}
        >
          <Icon eventType={EventType.Primary} size={Size.Large}>
            <Cog8ToothIcon />
          </Icon>
        </Button>
      )}
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
  )
}
