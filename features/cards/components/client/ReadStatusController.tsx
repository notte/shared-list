"use client"
import Button from "@/components/ui/Button"
import { useTransition } from "react"
import { Variant, ButtonAction } from "@/types/enums"
import { toastStore } from "@/lib/toastStore"
import { markCardAsRead } from "@/features/cards/actions/markCardAsRead"

export type ReadStatusControllerProps = {
  listId: string
  cardId: string
  isRead: boolean
}

export default function ReadStatusController({
  listId,
  cardId,
  isRead,
}: ReadStatusControllerProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await markCardAsRead(listId, cardId)
        toastStore.add(Variant.Success, "Card successfully marked as read.")
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred"
        toastStore.add(Variant.Danger, message)
      }
    })
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Once marked as read, this cannot be undone.
      </p>
      <Button
        disabled={isRead || isPending}
        variant={isRead ? Variant.Default : Variant.Success}
        action={ButtonAction.Custom}
        onClick={handleSubmit}
        buttonText={
          isRead ? "Already Read" : isPending ? "Marking..." : "Mark as Read"
        }
      />
    </div>
  )
}
