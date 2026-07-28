"use client"
import Icon from "@/components/ui/Icon"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import CardForm from "@/features/cards/components/client/CardForm"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { PlusCircleIcon, UserGroupIcon } from "@heroicons/react/24/solid"
import { ButtonAction, Variant, Size, DialogRole } from "@/types/enums"
import { useUserData } from "@/services/storage/user.client"
import { GetListDetailResponse } from "@/features/lists/adapters/response"

export default function NavRight({
  listId,
  listData,
}: {
  listId: string
  listData: GetListDetailResponse
}) {
  const pathname = usePathname()
  const userData = useUserData()
  const creatorId = listData.createdBy.userId
  const isCreator = !!userData?.userId && userData.userId === creatorId
  const isCardListPage = pathname === `/lists/${listId}`

  const [openCreateCardDialog, setOpenCreateCardDialog] =
    useState<boolean>(false)

  return (
    <>
      <div className="flex items-center gap-4">
        {isCardListPage && isCreator && (
          <Button
            variant={Variant.Icon}
            action={ButtonAction.Navigate}
            path={`/lists/${listId}/setting`}
          >
            <Icon variant={Variant.Primary} size={Size.Large}>
              <UserGroupIcon />
            </Icon>
          </Button>
        )}
        {isCardListPage && (
          <Button
            variant={Variant.Icon}
            action={ButtonAction.Custom}
            onClick={() => {
              setOpenCreateCardDialog(true)
            }}
          >
            <Icon variant={Variant.Primary} size={Size.Large}>
              <PlusCircleIcon />
            </Icon>
          </Button>
        )}
      </div>
      {/* 建立卡片 Dialog */}
      <Dialog
        open={openCreateCardDialog}
        onClose={() => {
          setOpenCreateCardDialog(false)
        }}
        role={DialogRole.Dialog}
      >
        <div className="w-full flex flex-col m-0 p-0 items-center justify-center">
          <div className="w-full flex flex-col mb-6">
            <h2 className="subheading">Create Card</h2>
            <h3 className="section-title">
              Share an update, plan an event, or start a vote — all in one
              place.
            </h3>
          </div>
          <CardForm onSuccess={() => setOpenCreateCardDialog(false)} />
        </div>
      </Dialog>
    </>
  )
}
