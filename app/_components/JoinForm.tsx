"use client"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Dialog from "@/components/ui/Dialog"
import { useState } from "react"
import { httpClient } from "@/services/http/client"
import { Variant, ButtonAction, DialogRole } from "@/types/enums"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { JoinListRequest } from "@/features/lists/adapters/request"
import { saveUserId } from "@/services/storage/userStorage"
import { themeColors } from "@/lib/utils"
import * as z from "zod"
import { JoinListResponse } from "@/features/lists/adapters/response"
import { useRouter } from "next/navigation"
import { toastStore } from "@/lib/toastStore"

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

  const handleFinalSubmit = async () => {
    if (!tempData) return

    await httpClient<JoinListRequest, JoinListResponse>({
      url: `/api/invites/${[inviteCode]}/join`,
      method: "POST",
      revalidate: 0,
      payload: tempData,
    }).then(async (res) => {
      if (res) {
        await saveUserId()
        setOpen(false)
        toastStore.add(Variant.Success, res.message)
        router.push(`${window.location.origin}/lists/${res.listId}`)
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
      />
    </>
  )
}
