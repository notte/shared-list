"use client"
import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { ButtonAction, Variant, Size } from "@/types/enums"
import { UserPlusIcon } from "@heroicons/react/16/solid"
import { httpClient } from "@/services/http/client"
import { useRouter } from "next/navigation"
import { CreateInviteResponse } from "@/features/lists/adapters/response"

export default function MemberList({
  children,
  listId,
}: {
  children: React.ReactNode
  listId: string
}) {
  const router = useRouter()

  const createListInvite = async () => {
    await httpClient<void, CreateInviteResponse>({
      url: `/api/lists/${listId}/invites`,
      method: "POST",
      revalidate: 0,
      successMessage: "Invite created.",
    })
    router.refresh()
  }

  return (
    <div className="w-full flex flex-col m-0 p-0 items-center justify-center">
      <div className="w-1/2 flex justify-between mb-6">
        <h2 className="subheading">Member List</h2>
        <Button
          buttonText="Add Memeber"
          variant={Variant.Primary}
          action={ButtonAction.Navigate}
          onClick={createListInvite}
        >
          <Icon variant={Variant.Primary} size={Size.Small}>
            <UserPlusIcon />
          </Icon>
        </Button>
      </div>
      {children}
    </div>
  )
}
