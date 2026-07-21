"use client"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import { Variant, ButtonAction, DialogRole } from "@/types/enums"
import { Invite } from "@/features/lists/schemas/list.schema"
import { useState } from "react"
import { toastStore } from "@/lib/toastStore"
import { httpClient } from "@/services/http/client"
import { useRouter } from "next/navigation"

export type MemberItemProps = Partial<Invite>

export default function MemberItem({
  inviteCode,
  userName,
  createdAt,
  joinedAt,
  listId,
  userId,
}: MemberItemProps) {
  const router = useRouter()

  // 刪除成員 or 刪除邀請碼
  const [isRemoveMember, setIsRemoveMember] = useState<boolean>(false)

  const [open, setOpen] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const status = inviteCode ? "pending" : "joined"

  const handleCopy = async () => {
    // 動態組合目前的網域與邀請路徑
    const joinUrl = `${window.location.origin}/join/${inviteCode}`

    try {
      // 呼叫原生剪貼簿 API
      await navigator.clipboard.writeText(joinUrl)

      // 複製成功後的反饋邏輯
      toastStore.add(Variant.Success, "Copy successful.")
      setCopied(true)
      setTimeout(() => setCopied(false), 5000)
    } catch {
      toastStore.add(Variant.Danger, "Copy failed.")
    }
  }

  const handleDeleteMember = async (userId: string) => {
    await httpClient({
      url: `/api/lists/${listId}/members`,
      method: "DELETE",
      successMessage: "Member deleted successfully.",
      payload: { userId },
    })
    setOpen(false)
    router.refresh()
  }

  const handleDeleteInvite = async (code: string) => {
    await httpClient({
      url: `/api/invites/${code}`,
      method: "DELETE",
      successMessage: "Invitation code successfully deleted.",
      payload: { inviteCode: code },
    })
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="card-container flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex justify-between items-center">
            <p className={`status-badge status-${status} mr-2`}>{status}</p>
            {inviteCode && <p>{inviteCode}</p>}
            {userName && <p>{userName}</p>}
          </div>
          <div className="text-sm text-stone flex items-end mr-2">
            {createdAt && (
              <p>Created: {createdAt?.toLocaleDateString("zh-TW")}</p>
            )}
            {joinedAt && <p>Joined: {joinedAt?.toLocaleDateString("zh-TW")}</p>}
          </div>
        </div>
        <div className="flex justify-end items-center">
          {createdAt && (
            <div className="flex gap-2">
              <Button
                buttonText={copied ? "Copied" : "Copy link"}
                variant={copied ? Variant.Default : Variant.Primary}
                action={ButtonAction.Custom}
                onClick={handleCopy}
                disabled={copied}
              />
              <Button
                buttonText="Delete"
                variant={Variant.Danger}
                action={ButtonAction.Custom}
                onClick={() => {
                  setOpen(true)
                  setIsRemoveMember(false)
                }}
              />
            </div>
          )}
          {joinedAt && (
            <Button
              buttonText="Delete"
              variant={Variant.Danger}
              action={ButtonAction.Custom}
              onClick={() => {
                setOpen(true)
                setIsRemoveMember(true)
              }}
            />
          )}
        </div>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          isRemoveMember
            ? handleDeleteMember(userId!)
            : handleDeleteInvite(inviteCode!)
        }
        title={isRemoveMember ? "Remove Member?" : "Revoke Invitation?"}
        description={
          isRemoveMember
            ? `You are about to remove "${userName}".`
            : "Are you sure you want to revoke this invitation code? Once deleted, it can no longer be used to join the list."
        }
        role={DialogRole.AlertDialog}
      />
    </>
  )
}
