"use client"
import Input from "@/components/ui/Input"
import Tiptap from "@/components/ui/Tiptap"
import DatePicker from "@/components/ui/DatePicker"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import VoteFormFields from "./VoteFormFields"
import { useParams, useRouter } from "next/navigation"
import { httpClient } from "@/services/http/client"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ButtonAction, CardType, Variant } from "@/types/enums"
import { CardRequest } from "@/features/cards/adapters/request"
import { useUserData } from "@/services/storage/userStorage"
import * as z from "zod"

// Vote Option 驗證 Schema
export const voteOptionSchema = z.object({
  voteOptionId: z.string(),
  text: z.string().min(1, "The options cannot be empty."),
  voteCount: z.number(),
})

// Vote Schema 驗證 Schema
export const voteSchema = z
  .object({
    isMultipleChoice: z.boolean(),
    maxChoices: z.number().min(1, "Select at least one item."),
    options: z
      .array(voteOptionSchema)
      .min(2, "At least two options need to be provided."),
  })
  // .refine：用於自訂的驗證邏輯
  .refine((data) => data.maxChoices <= data.options.length, {
    message: "The number of options cannot exceed the total number of options.",
    path: ["maxChoices"], // 將錯誤訊息綁定在 maxChoices 欄位上
  })

const baseCardSchema = z.object({
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
  userName: z.string().optional(),
  color: z.string().optional(),
})
const announceCardSchema = baseCardSchema.extend({
  cardType: z.literal(CardType.Announce),
})
const voteCardSchema = baseCardSchema.extend({
  cardType: z.literal(CardType.Vote),
  vote: voteSchema,
})

// 根據特定欄位，來快速區分並驗證不同結構的資料
export const cardFormSchema = z.discriminatedUnion("cardType", [
  announceCardSchema,
  voteCardSchema,
])

// Zod Schema（如 z.object）是在「執行期（Runtime）」用來驗證資料的
// 而 z.infer 則是把它轉換成「編譯期（Compile-time）」給 TypeScript 看的型態（Type）
export type CardFormValues = z.infer<typeof cardFormSchema>
export type CardFormProps = Partial<CardFormValues> & {
  onSuccess?: () => void
}

export default function CardForm(props: CardFormProps) {
  const params = useParams()
  const router = useRouter()
  const listId = params.listId as string

  const userData = useUserData()

  const {
    title,
    description,
    content,
    cardType,
    address,
    publishTime,
    endTime,
    eventTime,
    onSuccess,
  } = props

  // 分開解構
  const vote = "vote" in props ? props.vote : undefined

  const {
    control,
    trigger,
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
      vote: vote ?? {
        maxChoices: 1,
        isMultipleChoice: false,
        options: [],
      },
    },
  })

  // 監聽選擇的卡片類型
  const cardTypeValue = useWatch({
    control,
    name: "cardType",
  })

  const onSubmit = async (data: CardFormValues) => {
    const requestData = {
      ...data,
      userName: userData?.userName,
      color: userData?.color,
    }
    await httpClient<CardRequest, { message: string }>({
      url: `/api/lists/${listId}/cards`,
      method: "POST",
      payload: requestData,
      successMessage: "Card created successfully.",
    }).then(async () => {
      if (onSuccess) onSuccess()
      router.refresh()
    })
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="items-center">
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
        <div className="w-full grid grid-cols-2 gap-4">
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
        </div>

        {cardTypeValue === CardType.Vote && (
          <VoteFormFields control={control} errors={errors} trigger={trigger} />
        )}
        <Button
          buttonText="Submit"
          variant={Variant.Primary}
          action={ButtonAction.Submit}
        />
      </form>
    </div>
  )
}
