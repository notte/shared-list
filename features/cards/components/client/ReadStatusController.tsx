"use client"
import Button from "@/components/ui/Button"
import { httpClient } from "@/services/http/client"
import { useRouter } from "next/navigation"
import { Variant, ButtonAction } from "@/types/enums"

export type ReadStatusControllerProps = {
  listId: string
  cardId: string
  isRead: boolean
}

export default function ReadStatusController(props: ReadStatusControllerProps) {
  const router = useRouter()
  const { listId, cardId, isRead } = props

  const handleSubmit = async () => {
    await httpClient({
      url: `/api/lists/${listId}/cards/${cardId}/read`,
      method: "PATCH",
      successMessage: "Card successfully marked as read.",
    }).then(() => {
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Once marked as read, this cannot be undone.
      </p>
      <Button
        disabled={isRead}
        variant={isRead ? Variant.Default : Variant.Success}
        action={ButtonAction.Custom}
        onClick={handleSubmit}
        buttonText={isRead ? "Already Read" : "Mark as Read"}
      />
    </div>
  )
}
