"use client"
import Button from "@/components/ui/Button"
import Dialog from "@/components/ui/Dialog"
import { Variant, ButtonAction, DialogRole, InviteStatus } from "@/types/enums"
import {
  GetInviteCodeDetailResponse,
  MemberResponseItem,
} from "@/features/lists/adapters/response"
import { useState, useTransition } from "react"
import { toastStore } from "@/lib/toastStore"
import { formatForDisplay } from "@/lib/date"
import { removeMember } from "@/features/lists/actions/removeMember"
import { deleteInvite } from "@/features/lists/actions/deleteInvite"

export type MemberItemProps = Partial<
  GetInviteCodeDetailResponse & MemberResponseItem
>

export default function MemberItem({
  inviteCode,
  userName,
  createdAt,
  joinedAt,
  listId,
  userId,
}: MemberItemProps) {
  const [isPending, startTransition] = useTransition()

  const [isRemoveMember, setIsRemoveMember] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  const status = inviteCode ? InviteStatus.Pending : InviteStatus.Joined

  const handleCopy = async () => {
    const joinUrl = `${window.location.origin}/join/${inviteCode}`

    try {
      await navigator.clipboard.writeText(joinUrl)

      toastStore.add(Variant.Success, "Copy successful.")
      setCopied(true)
      setTimeout(() => setCopied(false), 5000)
    } catch {
      toastStore.add(Variant.Danger, "Copy failed.")
    }
  }

  const handleDeleteMember = (userId: string) => {
    startTransition(async () => {
      try {
        await removeMember(listId!, userId)
        toastStore.add(
          Variant.Success,
          "Member successfully removed from the list.",
        )
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred"
        toastStore.add(Variant.Danger, message)
      }
    })
    setOpen(false)
  }

  const handleDeleteInvite = (inviteCode: string) => {
    startTransition(async () => {
      try {
        await deleteInvite(listId!, inviteCode)
        toastStore.add(Variant.Success, "Invite Code successfully deleted.")
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred"
        toastStore.add(Variant.Danger, message)
      }
    })
    setOpen(false)
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
            {createdAt && <p>Created: {formatForDisplay(createdAt)}</p>}
            {joinedAt && <p>Joined: {formatForDisplay(joinedAt)}</p>}
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
                disabled={isPending}
                buttonText={isPending ? "Delete..." : "Delete"}
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
              disabled={isPending}
              buttonText={isPending ? "Delete..." : "Delete"}
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
        title={isRemoveMember ? "Remove Member？" : "Revoke Invitation?"}
        description={
          isRemoveMember
            ? `You are about to remove "${userName}".`
            : "Are you sure you want to revoke this invitation code? Once deleted, it can no longer be used to join the list."
        }
        role={DialogRole.AlertDialog}
        confirmDisabled={isPending}
        confirmText={
          isPending ? "Processing..." : isRemoveMember ? "Remove" : "Revoke"
        }
      />
    </>
  )
}
