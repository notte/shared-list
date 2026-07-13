"use client"
import Input from "@/components/ui/Input"
import {
  EditCardRequest,
  CreateCardRequest,
} from "@/features/cards/adapters/request"
import * as z from "zod"
import { useForm, Controller } from "react-hook-form"
import DatePicker from "@/components/ui/DatePicker"

const cardSchema = z.object({
  title: z
    .string()
    .max(15, { message: "Title must be 15 characters or less" })
    .min(1, { message: "Title is required" }),
  description: z.string().max(200).optional(),
  eventTime: z.date(),
  publishTime: z.date(),
  endTime: z.date(),
})

export default function CardForm(params?: EditCardRequest) {
  const { formState, setValue } = useForm<EditCardRequest | CreateCardRequest>({
    defaultValues: {
      title: params?.title ?? "",
      description: params?.description ?? "",
      content: params?.content ?? "",
      address: params?.address ?? "",
      publishTime: params?.publishTime ?? new Date(),
      endTime: params?.endTime ?? new Date(),
      eventTime: params?.eventTime ?? new Date(),
    },
  })

  const onSubmit = async (data: CreateCardRequest | EditCardRequest) => {}

  return (
    <>
      {/* Title 欄位 */}
      <Input
        label="Title"
        description="A short title for this card."
        value={formState.defaultValues?.title}
        onChange={(value) => setValue("title", value)}
      />
      {/* Description 欄位 */}
      <Input
        label="Description"
        description="Add extra details or notes here."
        value={formState.defaultValues?.description}
        onChange={(value) => setValue("description", value)}
      />
      {/* Location 欄位 */}
      <Input
        label="Location"
        description="Where this takes place (optional)."
        value={formState.defaultValues?.address}
        onChange={(value) => setValue("address", value)}
      />
      {/* 發布時間 */}
      <DatePicker
        mode="single"
        label="Publish Time"
        description="When this card will become visible."
        value={formState.defaultValues?.publishTime?.toISOString() ?? ""}
        onChange={(value) => {
          if (value !== undefined) setValue("publishTime", new Date(value))
        }}
      />
      {/* 展示截止時間 */}
      <DatePicker
        mode="single"
        label="End Time"
        description="When this card will be hidden."
        value={formState.defaultValues?.endTime?.toISOString() ?? ""}
        onChange={(value) => {
          if (value !== undefined) setValue("endTime", new Date(value))
        }}
      />
      {/* 活動時間 */}
      <DatePicker
        mode="single"
        label="Event Time"
        description="The date and time of this activity."
        value={formState.defaultValues?.eventTime?.toISOString() ?? ""}
        onChange={(value) => {
          if (value !== undefined) setValue("eventTime", new Date(value))
        }}
      />
    </>
  )
}
