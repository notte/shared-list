"use client"
import Input from "@/components/ui/Input"
import Tiptap from "@/components/ui/Tiptap"
import DatePicker from "@/components/ui/DatePicker"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import { CardRequest } from "@/features/cards/adapters/request"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ButtonAction, CardType, Variant } from "@/types/enums"
import * as z from "zod"

const announceCardSchema = z.object({
  cardType: z.literal(CardType.Announce),
  // 其他公告卡片必填欄位 (如 eventTime: z.date())
  title: z
    .string()
    .max(15, { message: "Title must be 15 characters or less" })
    .min(1, { message: "Title is required" }),
  description: z
    .string()
    .max(200)
    .min(1, { message: "Description is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  address: z.string(),
  eventTime: z.date({
    message: "Event time is required",
  }),
  publishTime: z.date({
    message: "Publish time is required",
  }),
  endTime: z.date({
    message: "End time is required",
  }),
})

const voteCardSchema = z.object({
  cardType: z.literal(CardType.Vote),
  // 投票相關欄位 vote: voteSchema,
  title: z
    .string()
    .max(15, { message: "Title must be 15 characters or less" })
    .min(1, { message: "Title is required" }),
  description: z
    .string()
    .max(200)
    .min(1, { message: "Description is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  address: z.string(),
  eventTime: z.date({
    message: "Event time is required",
  }),
  publishTime: z.date({
    message: "Publish time is required",
  }),
  endTime: z.date({
    message: "End time is required",
  }),
})

const cardFormSchema = z.discriminatedUnion("cardType", [
  announceCardSchema,
  voteCardSchema,
])

type CardFormValues = z.infer<typeof cardFormSchema>
type CardFormProps = Partial<CardRequest>

export default function CardForm({
  title,
  description,
  content,
  cardType,
  eventTime,
  publishTime,
  endTime,
  address,
}: CardFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      title: title ?? "",
      description: description ?? "",
      content: content ?? "",
      address: address ?? "",
      cardType: cardType ?? CardType.Announce,
      publishTime: publishTime ?? undefined,
      endTime: endTime ?? undefined,
      eventTime: eventTime ?? undefined,
    },
  })

  const cardTypeValue = useWatch({
    control,
    name: "cardType",
  })

  const onSubmit = async (data: CardRequest) => {}

  return (
    <div className="w-1/2 flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="items-start">
        {/* 卡片類型 */}
        <Controller
          name="cardType"
          control={control}
          render={({ field }) => (
            <Select
              label="Card Type"
              description="Choose a card type for this post."
              value={field.value}
              onChange={field.onChange}
              options={Object.values(CardType).map((type) => ({
                label: type,
                value: type,
              }))}
              errorText={errors.cardType?.message}
            />
          )}
        />

        {/* Title 欄位 */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              label="Title"
              description="A short title for this card."
              value={field.value || ""}
              onChange={field.onChange}
              errorText={errors.title?.message}
            />
          )}
        />

        {/* Description 欄位 */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              label="Description"
              description="Add extra details or notes here."
              value={field.value || ""}
              onChange={field.onChange}
              errorText={errors.description?.message}
            />
          )}
        />
        {/* Content 欄位 */}
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Tiptap
              value={field.value || ""}
              onChange={field.onChange}
              errorText={errors.content?.message}
            />
          )}
        />

        {/* Location 欄位 */}
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input
              label="Location"
              description="Where this takes place (optional)."
              value={field.value || ""}
              onChange={field.onChange}
              errorText={errors.address?.message}
            />
          )}
        />

        {/* 發布時間 */}
        <Controller
          name="publishTime"
          control={control}
          render={({ field }) => (
            <DatePicker
              mode="single"
              label="Publish Time"
              description="When this card will become visible to members."
              value={field.value?.toISOString() ?? ""}
              onChange={field.onChange}
              errorText={errors.publishTime?.message}
            />
          )}
        />
        {/* 展示截止時間 */}
        <Controller
          name="endTime"
          control={control}
          render={({ field }) => (
            <DatePicker
              mode="single"
              label="End Time"
              description="When this card will no longer be visible."
              value={field.value?.toISOString() ?? ""}
              onChange={field.onChange}
              errorText={errors.endTime?.message}
            />
          )}
        />
        {/* 活動時間 */}
        <Controller
          name="eventTime"
          control={control}
          render={({ field }) => (
            <DatePicker
              mode="single"
              label="Event Time"
              description="The date and time of this activity."
              value={field.value?.toISOString() ?? ""}
              onChange={field.onChange}
              errorText={errors.eventTime?.message}
            />
          )}
        />

        <Button
          buttonText="Submit"
          variant={Variant.Primary}
          action={ButtonAction.Submit}
        />
      </form>
      {cardTypeValue === CardType.Vote && <>投票功能</>}
    </div>
  )
}
