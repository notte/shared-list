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
        const result = await createList(
          token,
          data.title,
          data.userName,
          data.color,
        )

        if (result.success) {
          toastStore.add(
            Variant.Success,
            "List and personal information successfully created.",
          )
          router.push(`/lists/${result.data}`)
        } else {
          toastStore.add(
            Variant.Danger,
            result.error || "An error occurred while creating the list.",
          )
        }
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
