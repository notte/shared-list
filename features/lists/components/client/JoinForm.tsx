"use client"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Dialog from "@/components/ui/Dialog"
import * as z from "zod"
import { useState, useTransition } from "react"
import { Variant, ButtonAction, DialogRole } from "@/types/enums"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { JoinListRequest } from "@/features/lists/adapters/request"
import { saveUserData } from "@/services/storage/user.client"
import { themeColors } from "@/lib/theme"
import { useRouter } from "next/navigation"
import { toastStore } from "@/lib/toastStore"
import { joinList } from "@/features/lists/actions/joinList"
import { auth, getCurrentUser } from "@/lib/firebase.client"

// 定義驗證 Schema
const joinListSchema = z.object({
  userName: z
    .string()
    .max(15, { message: "Nickname must be 15 characters or less" })
    .min(1, { message: "Nickname is required" }),
  color: z.string().refine((val) => themeColors.some((t) => t.value === val), {
    message: "Please select a valid color",
  }),
})

export default function JoinForm({
  inviteCode,
  title,
}: {
  inviteCode: string
  title: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState<boolean>(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<JoinListRequest>({
    resolver: zodResolver(joinListSchema),
    defaultValues: {
      userName: "",
      color: themeColors[0].value,
    },
  })
  const [tempData, setTempData] = useState<JoinListRequest | null>(null)

  const onSubmit = async (data: JoinListRequest) => {
    setTempData(data)
    setOpen(true)
  }

  const handleFinalSubmit = () => {
    startTransition(async () => {
      if (!tempData) return
      const currentUser = auth.currentUser ?? (await getCurrentUser())
      if (!currentUser) {
        toastStore.add(
          Variant.Danger,
          "The user is not logged in and cannot send a request.",
        )
        return
      }
      const token = await currentUser.getIdToken()
      try {
        const listId = await joinList(
          token,
          inviteCode,
          tempData.userName,
          tempData.color,
        )
        await saveUserData(tempData.color, tempData.userName)
        setOpen(false)
        toastStore.add(Variant.Success, "Joined successfully.")
        router.push(`/lists/${listId}`)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred"
        toastStore.add(Variant.Danger, message)
      }
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* UserName 欄位 */}
        <Controller
          name="userName"
          control={control}
          render={({ field }) => (
            <Input
              label="Display Name"
              description="The name other members will see on your cards and activities in this list."
              value={field.value || ""}
              onChange={field.onChange}
              errorText={errors.userName?.message}
            />
          )}
        />

        {/* Color 欄位 */}
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <Select
              label="Your Theme Color"
              description="Choose a color to represent yourself in this list."
              value={field.value}
              onChange={field.onChange}
              options={themeColors.map((item) => ({
                ...item,
                slot: (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.value }}
                  />
                ),
              }))}
              errorText={errors.color?.message}
            />
          )}
        />

        {/* 調整 Button，使其可以觸發 form 的 submit */}
        <Button
          buttonText="Yes, Join List"
          variant={Variant.Primary}
          action={ButtonAction.Submit}
        />
      </form>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
          setTempData(null)
        }}
        onConfirm={handleFinalSubmit}
        title="Join this list？"
        description={`You are about to join "${title}" as "${getValues("userName")}".`}
        role={DialogRole.AlertDialog}
        confirmDisabled={isPending}
        confirmText={isPending ? "Joining..." : "Yes, Join"}
      />
    </>
  )
}
