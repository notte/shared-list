import { CardType } from "@/types/enums"
import z from "zod"

export const voteOptionSchema = z.object({
  voteOptionId: z.string(),
  text: z.string().min(1, "The options cannot be empty."),
  voteCount: z.number(),
})

export const voteSchema = z
  .object({
    isMultipleChoice: z.boolean(),
    maxChoices: z.number(),
    options: z
      .array(voteOptionSchema)
      .min(2, "At least two options need to be provided."),
  })
  .refine(
    (data) => !data.isMultipleChoice || data.maxChoices <= data.options.length,
    {
      message: "Max choices cannot exceed the total number of options.",
      path: ["maxChoices"],
    },
  )
  .refine((data) => !data.isMultipleChoice || data.maxChoices > 1, {
    message: "Max choices must be greater than 1 for multiple choice votes.",
    path: ["maxChoices"],
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

    if (!hasSingleTime && !hasRange) {
      ctx.addIssue({
        code: "custom",
        message:
          "Please set an event time (either a single time or a time range).",
        path: ["eventTime"],
      })
      return
    }
    if (hasSingleTime && hasRange) {
      ctx.addIssue({
        code: "custom",
        message:
          "Please choose either a single time or a time range, not both.",
        path: ["eventTime"],
      })
      return
    }
    if (hasRange && (!hasStart || !hasEnd)) {
      ctx.addIssue({
        code: "custom",
        message: "Both start and end times are required for a time range.",
        path: !hasStart ? ["eventStartTime"] : ["eventEndTime"],
      })
      return
    }
    if (hasStart && hasEnd && data.eventEndTime! < data.eventStartTime!) {
      ctx.addIssue({
        code: "custom",
        message: "End time cannot be earlier than start time.",
        path: ["eventEndTime"],
      })
      return
    }

    const actualEventStart = data.eventTime || data.eventStartTime
    const actualEventEnd = data.eventTime || data.eventEndTime

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

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
    if (actualEventStart && actualEventStart <= data.publishTime) {
      ctx.addIssue({
        code: "custom",
        message: "Event time must be after publish time.",
        path: [data.eventTime ? "eventTime" : "eventStartTime"],
      })
    }
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

export const cardFormSchema = z.discriminatedUnion("cardType", [
  announceCardSchema,
  voteCardSchema,
])

export type CardFormValues = z.infer<typeof cardFormSchema>
