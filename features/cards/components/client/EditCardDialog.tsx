"use client"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import CardForm from "@/features/cards/components/client/CardForm"
import { httpClient } from "@/services/http/client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ButtonAction, Variant, DialogRole } from "@/types/enums"
import { GetCardDetailResponse } from "../../adapters/response"

export default function EditCardDialog({
  listId,
  cardId,
}: {
  listId: string
  cardId: string
}) {
  const router = useRouter()
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [openEditCardDialog, setOpenEditCardDialog] = useState<boolean>(false)
  const [cardDetail, setCardDetail] = useState<
    GetCardDetailResponse | undefined
  >(undefined)

  useEffect(() => {
    const fetchCardDetail = async () => {
      const res = await httpClient<undefined, GetCardDetailResponse>({
        url: `/api/lists/${listId}/cards/${cardId}`,
        method: "GET",
      })
      setCardDetail(res)
    }
    fetchCardDetail()
  }, [cardId, listId, openEditCardDialog])

  if (!cardDetail) return <></>

  const handleDeleteCard = async () => {
    await httpClient<undefined, GetCardDetailResponse>({
      url: `/api/lists/${listId}/cards/${cardId}`,
      method: "DELETE",
      successMessage: "Card deleted successfully.",
    })
    setAlertOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button
        buttonText="edit"
        variant={Variant.Success}
        action={ButtonAction.Custom}
        onClick={() => {
          setOpenEditCardDialog(true)
        }}
      />
      <Button
        buttonText="delete"
        variant={Variant.Danger}
        action={ButtonAction.Custom}
        onClick={() => {
          setAlertOpen(true)
        }}
      />
      {/* 編輯卡片 Dialog */}
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
      />
    </>
  )
}
