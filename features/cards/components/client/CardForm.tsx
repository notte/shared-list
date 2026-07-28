"use client"
import Input from "@/components/ui/Input"
import Tiptap from "@/components/ui/Tiptap"
import DatePicker from "@/components/ui/DatePicker"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import VoteFormFields from "./VoteFormFields"
import { z } from "zod"
import { useParams, useRouter } from "next/navigation"
import { httpClient } from "@/services/http/client"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ButtonAction, CardType, Variant } from "@/types/enums"
import { CardRequest } from "@/features/cards/adapters/request"
import { useUserData } from "@/services/storage/user.client"
import { GetCardDetailResponse } from "@/features/cards/adapters/response"
import { formatForInput, parseToDate, toIsoString } from "@/lib/date"
import { useState } from "react"

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

export const baseCardSchema = z
  .object({
    title: z
      .string()
      .min(1, { message: "Title is required" })
      .max(15, { message: "Title must be 15 characters or less" }),
    description: z
      .string()
      .min(1, { message: "Description is required" })
      .max(200, { message: "Description must be 200 characters or less" }),
    content: z.string().min(1, { message: "Content is required" }),
    address: z.string(),
    eventTime: z.date().optional().nullable(),
    eventStartTime: z.date().optional().nullable(),
    eventEndTime: z.date().optional().nullable(),
    publishTime: z.date({
      message: "Publish time is required",
    }),
    endTime: z.date({
      message: "End time is required",
    }),
    userName: z.string().optional(),
    color: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasSingleTime = Boolean(data.eventTime)
    const hasStart = Boolean(data.eventStartTime)
    const hasEnd = Boolean(data.eventEndTime)
    const hasRange = hasStart || hasEnd

    // 1. 完全沒填任何時間
    if (!hasSingleTime && !hasRange) {
      ctx.addIssue({
        code: "custom",
        message:
          "Please set an event time (either a single time or a time range).",
        path: ["eventTime"],
      })
      return
    }

    // 2. 單一時間與時間範圍衝突
    if (hasSingleTime && hasRange) {
      ctx.addIssue({
        code: "custom",
        message:
          "Please choose either a single time or a time range, not both.",
        path: ["eventTime"],
      })
      return
    }

    // 3. 時間範圍缺頭或缺尾
    if (hasRange && (!hasStart || !hasEnd)) {
      ctx.addIssue({
        code: "custom",
        message: "Both start and end times are required for a time range.",
        path: !hasStart ? ["eventStartTime"] : ["eventEndTime"],
      })
      return
    }

    // 4. 時間範圍的開始與結束比較
    if (hasStart && hasEnd && data.eventEndTime! < data.eventStartTime!) {
      ctx.addIssue({
        code: "custom",
        message: "End time cannot be earlier than start time.",
        path: ["eventEndTime"],
      })
      return
    }

    // -------------------------------------------------------------
    // 💡 關鍵：算出這檔活動「真正的開始時間」與「真正的結束時間」
    // -------------------------------------------------------------
    const actualEventStart = data.eventTime || data.eventStartTime
    const actualEventEnd = data.eventTime || data.eventEndTime

    // 取得當天的午夜 00:00:00，避免當下毫秒差導致選擇今天時被判定為過期
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    // 5. 不能早於今天 (publishTime, actualEventStart, endTime)
    if (data.publishTime < startOfToday) {
      ctx.addIssue({
        code: "custom",
        message: "Publish time cannot be earlier than today.",
        path: ["publishTime"],
      })
    }
    if (actualEventStart && actualEventStart < startOfToday) {
      ctx.addIssue({
        code: "custom",
        message: "Event time cannot be earlier than today.",
        path: [data.eventTime ? "eventTime" : "eventStartTime"],
      })
    }
    if (data.endTime < startOfToday) {
      ctx.addIssue({
        code: "custom",
        message: "End time cannot be earlier than today.",
        path: ["endTime"],
      })
    }

    // 6. 活動開始時間 (actualEventStart) 必須晚於 publishTime
    if (actualEventStart && actualEventStart <= data.publishTime) {
      ctx.addIssue({
        code: "custom",
        message: "Event time must be after publish time.",
        path: [data.eventTime ? "eventTime" : "eventStartTime"],
      })
    }

    // 7. 卡片下架時間 (endTime) 必須晚於活動結束時間 (actualEventEnd)
    if (actualEventEnd && data.endTime <= actualEventEnd) {
      ctx.addIssue({
        code: "custom",
        message: "End time must be after event end time.",
        path: ["endTime"],
      })
    }
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
export type CardFormProps = {
  card?: GetCardDetailResponse
  onSuccess?: () => void
}

export default function CardForm(props: CardFormProps) {
  const params = useParams()
  const router = useRouter()
  const listId = params.listId as string

  const userData = useUserData()
  const { card, onSuccess } = props
  const vote = card && "vote" in card ? card.vote : undefined

  const defaultValues = {
    title: card?.title ?? "",
    description: card?.description ?? "",
    content: card?.content ?? "",
    address: card?.address ?? "",
    cardType: card?.cardType ?? CardType.Announce,
    publishTime: parseToDate(card?.publishTime) ?? undefined,
    endTime: parseToDate(card?.endTime) ?? undefined,
    eventTime: parseToDate(card?.eventTime) ?? undefined,
    eventStartTime: parseToDate(card?.eventStartTime) ?? undefined,
    eventEndTime: parseToDate(card?.eventEndTime) ?? undefined,
    vote: vote ?? {
      maxChoices: 1,
      isMultipleChoice: false,
      options: [],
    },
  } as CardFormValues
  const {
    control,
    trigger,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues,
  })

  // 監聽選擇的卡片類型
  const cardTypeValue = useWatch({
    control,
    name: "cardType",
  })

  const eventStartTime = useWatch({ control, name: "eventStartTime" })
  const eventEndTime = useWatch({ control, name: "eventEndTime" })

  const [mode, setMode] = useState<"single" | "range">(
    eventStartTime && eventEndTime ? "range" : "single",
  )

  const handleModeChange = (newMode: "single" | "range") => {
    setMode(newMode)

    if (newMode === "single") {
      // 切到單選，清空範圍時間
      setValue("eventStartTime", null)
      setValue("eventEndTime", null)
    } else {
      // 切到範圍，清空單一時間
      setValue("eventTime", null)
    }
  }

  const formattedRangeValue =
    eventStartTime || eventEndTime
      ? `${formatForInput(eventStartTime)} - ${formatForInput(eventEndTime)}`
      : ""

  const onSubmit = async (data: CardFormValues) => {
    console.log("RAW FORM DATA:", data)
    const requestData = {
      ...data,
      publishTime: data.publishTime?.toISOString(),
      endTime: data.endTime?.toISOString(),
      eventTime: toIsoString(data.eventTime),
      eventStartTime: toIsoString(data.eventStartTime),
      eventEndTime: toIsoString(data.eventEndTime),
      userName: userData?.userName,
      color: userData?.color,
    }

    console.log(data)
    await httpClient<CardRequest, { message: string }>({
      url: card
        ? `/api/lists/${listId}/cards/${card.cardId}`
        : `/api/lists/${listId}/cards`,
      method: card ? "PUT" : "POST",
      payload: requestData,
      successMessage: card
        ? "Card updated successfully."
        : "Card created successfully.",
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
        <div className="w-full grid grid-cols-2 gap-4">
          <Select
            label="Event Time Mode"
            description="Select a single date or a date range."
            value={mode}
            onChange={(value) => handleModeChange(value as "single" | "range")}
            options={[
              { label: "Single Day", value: "single" },
              { label: "Date Range", value: "range" },
            ]}
          />

          {mode === "single" && (
            <Controller
              name="eventTime"
              control={control}
              render={({ field }) => (
                <DatePicker
                  mode="single"
                  label="Event Time"
                  description="The date and time of this activity."
                  value={formatForInput(field.value)}
                  onChange={field.onChange}
                  errorText={errors.eventTime?.message}
                />
              )}
            />
          )}
          {mode === "range" && (
            <>
              <DatePicker
                mode="range"
                label="Event Time"
                description="Select the start and end dates."
                // 修正：傳入串接後的 string，避免傳入物件
                value={formattedRangeValue}
                onChange={(range) => {
                  // 假設 DatePicker 的 onChange 會回傳 { from: Date, to: Date }
                  setValue("eventStartTime", range?.from, {
                    shouldValidate: true,
                  })
                  setValue("eventEndTime", range?.to, { shouldValidate: true })
                }}
                errorText={
                  errors.eventStartTime?.message || errors.eventEndTime?.message
                }
              />
            </>
          )}
        </div>
        <div className="w-full grid grid-cols-2 gap-4">
          <Controller
            name="publishTime"
            control={control}
            render={({ field }) => (
              <DatePicker
                mode="single"
                label="Publish Time"
                description="When this card will become visible to members."
                value={formatForInput(field.value)}
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
                value={formatForInput(field.value)}
                onChange={field.onChange}
                errorText={errors.endTime?.message}
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
