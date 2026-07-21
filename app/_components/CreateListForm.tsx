"use client"

import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import { httpClient } from "@/services/http/client"
import { Variant, ButtonAction } from "@/types/enums"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateListRequest } from "@/features/lists/adapters/request"
import * as z from "zod"
import { saveUserId } from "@/services/storage/userStorage"
import { themeColors } from "@/lib/utils"

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
  const onSubmit = async (data: CreateListRequest) => {
    await saveUserId()
    await httpClient<CreateListRequest, void>({
      url: "/api/lists",
      method: "POST",
      payload: data,
      successMessage: "Added successfully.",
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
          buttonText="Submit"
          variant={Variant.Primary}
          disabled={false}
          action={ButtonAction.Submit}
        />
      </form>
    </>
  )
}
