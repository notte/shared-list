"use client"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import CardForm from "@/features/cards/components/client/CardForm"
import { useState, useEffect, useTransition } from "react"
import { ButtonAction, Variant, DialogRole } from "@/types/enums"
import { toastStore } from "@/lib/toastStore"
import { deleteCard } from "@/features/cards/actions/deleteCard"
import { GetCardDetailResponse } from "@/features/cards/adapters/response"
import { getCardForEdit } from "@/features/cards/actions/getCardForEdit"

export default function EditCardDialog({
  listId,
  cardId,
  isEnd,
  isPublish,
}: {
  listId: string
  cardId: string
  isEnd: boolean
  isPublish: boolean
}) {
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()
  const [openEditCardDialog, setOpenEditCardDialog] = useState<boolean>(false)
  const [cardDetail, setCardDetail] = useState<
    GetCardDetailResponse | undefined
  >(undefined)

  useEffect(() => {
    const fetchCardDetail = async () => {
      const res = await getCardForEdit(listId, cardId)
      setCardDetail(res ?? undefined)
    }
    fetchCardDetail()
  }, [cardId, listId, openEditCardDialog])

  if (!cardDetail) return <></>

  const handleDeleteCard = () => {
    startTransition(async () => {
      try {
        const result = await deleteCard(listId, cardId)
        if (result.success) {
          toastStore.add(Variant.Success, "Card successfully deleted.")
        } else {
          toastStore.add(
            Variant.Danger,
            result.error ?? "Failed to delete card.",
          )
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred"
        toastStore.add(Variant.Danger, message)
      }
      setAlertOpen(false)
    })
  }

  return (
    <>
      {!isPublish && !isEnd && (
        <Button
          buttonText="edit"
          variant={Variant.Success}
          action={ButtonAction.Custom}
          onClick={() => {
            setOpenEditCardDialog(true)
          }}
        />
      )}
      {(!isPublish || isEnd) && (
        <Button
          buttonText="delete"
          variant={Variant.Danger}
          action={ButtonAction.Custom}
          onClick={() => {
            setAlertOpen(true)
          }}
        />
      )}
      <Dialog
        open={openEditCardDialog}
        onClose={() => {
          setOpenEditCardDialog(false)
        }}
        role={DialogRole.Dialog}
      >
        <div className="w-full flex flex-col m-0 p-0 items-center justify-center">
          <div className="w-full flex flex-col mb-6">
            <h2 className="subheading">Edit Card</h2>
          </div>
          <CardForm
            card={cardDetail}
            onSuccess={() => setOpenEditCardDialog(false)}
          />
        </div>
      </Dialog>
      <Dialog
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={handleDeleteCard}
        title="Remove Card？"
        description="Are you sure you want to delete this card？This action cannot be undone."
        role={DialogRole.AlertDialog}
        confirmDisabled={isPending}
        confirmText={isPending ? "Deleting..." : "Delete"}
      />
    </>
  )
}
