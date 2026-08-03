"use client"
import Input from "@/components/ui/Input"
import Tiptap from "@/components/ui/Tiptap"
import DatePicker from "@/components/ui/DatePicker"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import VoteFormFields from "./VoteFormFields"
import { useParams } from "next/navigation"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ButtonAction, CardType, Variant } from "@/types/enums"
import { CardRequest } from "@/features/cards/adapters/request"
import { GetCardDetailResponse } from "@/features/cards/adapters/response"
import { formatForInput, parseToDate, toIsoString } from "@/lib/date"
import { useState, useTransition } from "react"
import {
  CardFormValues,
  cardFormSchema,
} from "@/features/cards/schemas/cardForm.schema"
import { toastStore } from "@/lib/toastStore"
import { createCard } from "@/features/cards/actions/createCard"
import { updateCard } from "@/features/cards/actions/updateCard"

export type CardFormProps = {
  card?: GetCardDetailResponse
  onSuccess?: () => void
}

export default function CardForm(props: CardFormProps) {
  const params = useParams()
  const [isPending, startTransition] = useTransition()
  const listId = params.listId as string

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
      setValue("eventStartTime", null)
      setValue("eventEndTime", null)
    } else {
      setValue("eventTime", null)
    }
  }

  const formattedRangeValue =
    eventStartTime || eventEndTime
      ? `${formatForInput(eventStartTime)} - ${formatForInput(eventEndTime)}`
      : ""

  const onSubmit = (data: CardFormValues) => {
    const requestData = {
      ...data,
      publishTime: data.publishTime?.toISOString(),
      endTime: data.endTime?.toISOString(),
      eventTime: toIsoString(data.eventTime),
      eventStartTime: toIsoString(data.eventStartTime),
      eventEndTime: toIsoString(data.eventEndTime),
    } as CardRequest

    startTransition(async () => {
      try {
        if (card) {
          const result = await updateCard(listId, card.cardId, requestData)
          if (result.success) {
            toastStore.add(Variant.Success, "Card updated successfully.")
          } else {
            toastStore.add(Variant.Danger, result.error)
          }
        } else {
          const result = await createCard(listId, requestData)
          if (result.success) {
            toastStore.add(Variant.Success, "Card created successfully.")
          } else {
            toastStore.add(Variant.Danger, result.error)
          }
        }
        if (onSuccess) onSuccess()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred"
        toastStore.add(Variant.Danger, message)
      }
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
              options={Object.values(CardType)
                .filter((type) => type !== CardType.Closed)
                .map((type) => ({
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
            <DatePicker
              mode="range"
              label="Event Time"
              description="Select the start and end dates."
              value={formattedRangeValue}
              onChange={(range) => {
                setValue("eventStartTime", range?.from, {
                  shouldValidate: true,
                })
                setValue("eventEndTime", range?.to, { shouldValidate: true })
              }}
              errorText={
                errors.eventStartTime?.message || errors.eventEndTime?.message
              }
            />
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
          disabled={isPending}
          buttonText={isPending ? "Submitting..." : "Submit"}
          variant={Variant.Primary}
          action={ButtonAction.Submit}
        />
      </form>
    </div>
  )
}
