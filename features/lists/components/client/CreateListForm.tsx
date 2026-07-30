"use client"

import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import * as z from "zod"
import { Variant, ButtonAction } from "@/types/enums"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateListRequest } from "@/features/lists/adapters/request"
import { saveUserData } from "@/services/storage/user.client"
import { themeColors } from "@/lib/theme"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { auth, getCurrentUser } from "@/lib/firebase.client"
import { toastStore } from "@/lib/toastStore"
import { createList } from "@/features/lists/actions/createList"

// 定義驗證 Schema
const createListsSchema = z.object({
  title: z
    .string()
    .max(15, { message: "List name must be 15 characters or less" })
    .min(1, { message: "List name is required" }),
  userName: z
    .string()
    .max(15, { message: "Nickname must be 15 characters or less" })
    .min(1, { message: "Nickname is required" }),
  color: z.string().refine((val) => themeColors.some((t) => t.value === val), {
    message: "Please select a valid color",
  }),
})

export default function CreateListForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListRequest>({
    resolver: zodResolver(createListsSchema),
    defaultValues: {
      title: "",
      userName: "",
      color: themeColors[0].value,
    },
  })

  // 表單驗證成功後的處理
  const onSubmit = (data: CreateListRequest) => {
    startTransition(async () => {
      const currentUser = auth.currentUser ?? (await getCurrentUser())
      if (!currentUser) {
        toastStore.add(
          Variant.Danger,
          "The user is not logged in and cannot send a request.",
        )
        return
      }

      try {
        const token = await currentUser.getIdToken()
        await saveUserData(data.color, data.userName)
        const listId = await createList(
          token,
          data.title,
          data.userName,
          data.color,
        )

        toastStore.add(
          Variant.Success,
          "List and personal information successfully created.",
        )
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
      {/* 使用 HTML form 元素包覆，並綁定 onSubmit */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title 欄位 */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              label="List Name"
              description="Give your list a recognizable name."
              value={field.value || ""}
              onChange={field.onChange}
              errorText={errors.title?.message}
            />
          )}
        />

        {/* UserName 欄位 */}
        <Controller
          name="userName"
          control={control}
          render={({ field }) => (
            <Input
              label="Creator Nickname"
              description="The nickname shown to other members."
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
              label="Your Color"
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
          buttonText={isPending ? "Creating..." : "Submit"}
          variant={Variant.Primary}
          disabled={isPending}
          action={ButtonAction.Submit}
        />
      </form>
    </>
  )
}
