"use client"
import Icon from "@/components/ui/Icon"
import { PlusCircleIcon, Cog8ToothIcon } from "@heroicons/react/24/solid"
import { ButtonAction, Variant, Size } from "@/types/enums"
import Button from "@/components/ui/Button"
import { getUserId } from "@/services/storage/userStorage"
import { useEffect, useState } from "react"
import { toastStore } from "@/lib/toastStore"
import { GetListDetailResponse } from "@/features/lists/adapters/response"

export default function NavRight({
  listId,
  listData,
}: {
  listId: string
  listData: GetListDetailResponse
}) {
  const creatorId = listData.createdBy.userId
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    const userId = getUserId()
    if (!userId) toastStore.add(Variant.Danger, "No identity found.")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCreator(!!userId && userId === creatorId)
  }, [creatorId])

  return (
    <div className="flex items-center gap-4">
      {isCreator && (
        <Button
          variant={Variant.Icon}
          action={ButtonAction.Navigate}
          path={`/lists/${listId}/setting`}
        >
          <Icon Variant={Variant.Primary} size={Size.Large}>
            <Cog8ToothIcon />
          </Icon>
        </Button>
      )}
      <Button variant={Variant.Icon} action={ButtonAction.Navigate}>
        <Icon Variant={Variant.Primary} size={Size.Large}>
          <PlusCircleIcon />
        </Icon>
      </Button>
    </div>
  )
}
