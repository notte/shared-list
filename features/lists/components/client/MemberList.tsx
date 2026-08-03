"use client"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { ButtonAction, Variant, Size } from "@/types/enums"
import { UserPlusIcon } from "@heroicons/react/16/solid"
import { useTransition } from "react"
import { toastStore } from "@/lib/toastStore"
import { createInvite } from "@/features/lists/actions/createInvite"

export default function MemberList({
  children,
  listId,
}: {
  children: React.ReactNode
  listId: string
}) {
  const [isPending, startTransition] = useTransition()

  const createListInvite = async () => {
    startTransition(async () => {
      try {
        const result = await createInvite(listId)

        if (result.success) {
          toastStore.add(Variant.Success, "Invite created.")
        } else {
          toastStore.add(Variant.Danger, result.error || "An error occurred.")
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred"
        toastStore.add(Variant.Danger, message)
      }
    })
  }

  return (
    <div className="w-full flex flex-col m-0 p-0 items-center justify-center">
      <div className="w-1/2 flex justify-between mb-6">
        <h2 className="subheading">Member List</h2>
        <Button
          disabled={isPending}
          buttonText={isPending ? "Adding..." : "Add Member"}
          variant={Variant.Primary}
          action={ButtonAction.Custom}
          onClick={createListInvite}
        >
          <Icon variant={Variant.Primary} size={Size.Small}>
            <UserPlusIcon className="w-4 h-4" />
          </Icon>
        </Button>
      </div>
      {children}
    </div>
  )
}
