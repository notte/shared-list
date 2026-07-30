import { CardType } from "@/types/enums"
import z from "zod"

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
