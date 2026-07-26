"use client"

import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import { Variant, ButtonAction, CardType } from "@/types/enums"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import {
  FieldErrors,
  Control,
  Controller,
  useFieldArray,
  useWatch,
  UseFormTrigger,
} from "react-hook-form"
import { CardFormValues } from "@/features/cards/components/client/CardForm"
import { useEffect } from "react"

interface VoteFormFieldsProps {
  control: Control<CardFormValues>
  errors: FieldErrors<CardFormValues>
  trigger: UseFormTrigger<CardFormValues>
}

export default function VoteFormFields({
  control,
  errors,
  trigger,
}: VoteFormFieldsProps) {
  const voteErrors = (
    errors as FieldErrors<Extract<CardFormValues, { cardType: CardType.Vote }>>
  ).vote

  const options = useWatch({
    control,
    name: "vote.options",
  })

  const maxValue = useWatch({ control, name: "vote.maxChoices" })

  // useFieldArray 管理動態選項陣列
  const { fields, append, remove } = useFieldArray({
    control,
    name: "vote.options" as const,
  })

  // 處理新增選項
  const handleAddOption = () => {
    append({
      voteOptionId: crypto.randomUUID(), // 自動生成唯一 id
      text: "",
      voteCount: 0,
    })
  }

  useEffect(() => {
    if (options || maxValue) {
      trigger("vote.maxChoices")
    }
  }, [options, options?.length, trigger, maxValue])

  return (
    <div className="w-full">
      <hr />
      <h3 className="section-title mb-4">Vote Setting</h3>
      <div className="flex gap-4">
        {/* ─── Multiple Choice ─────────────────────── */}
        <Controller
          name="vote.isMultipleChoice"
          control={control}
          render={({ field }) => (
            <Select
              label="Multiple Choice"
              description="Allow members to select more than one option."
              value={field.value === undefined ? "false" : String(field.value)}
              onChange={(selectedVal) => {
                // 將選中的字串轉為 boolean
                field.onChange(selectedVal === "true")
              }}
              options={[
                { label: "Single choice", value: "false" },
                { label: "Multiple choice", value: "true" },
              ]}
              errorText={voteErrors?.isMultipleChoice?.message}
            />
          )}
        />

        {/* ─── Max Choices ─────────────────────────── */}
        <Controller
          name="vote.maxChoices"
          control={control}
          render={({ field }) => (
            <Input
              label="Max Choices"
              description="How many options a member can select."
              value={field.value ?? 1}
              onChange={(val) => {
                const numVal = Number(val)
                // 清空或無效數字時寫入 1，否則寫入數字
                field.onChange(!val || isNaN(numVal) || numVal < 1 ? 1 : numVal)
              }}
              errorText={voteErrors?.maxChoices?.message}
            />
          )}
        />
      </div>

      {/* ─── Options ─────────────────────────────── */}
      <div className="w-full flex flex-col justify-center mt-4">
        <p className="input-label">Options</p>
        <p className="input-description">
          Add the choices members can vote for.
        </p>

        {/* 顯示陣列整體的錯誤訊息（例如：至少需要 2 個選項） */}
        {voteErrors?.options?.root?.message && (
          <p className="text-sm text-red-500 mt-1">
            {voteErrors.options.root.message}
          </p>
        )}

        <div className="w-full space-y-2 mt-2">
          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id} // 注意：React 渲染的 key 必須使用 useFieldArray 的 fieldItem.id
              className="flex items-center gap-2 [&_.input-error]:hidden"
            >
              <span
                className="text-sm w-5 shrink-0"
                style={{ color: "var(--muted)" }}
              >
                {index + 1}.
              </span>
              <div className="flex-1">
                <Controller
                  name={`vote.options.${index}.text`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      label=""
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      errorText={voteErrors?.options?.[index]?.text?.message}
                    />
                  )}
                />
              </div>
              <Button
                variant={Variant.Icon}
                action={ButtonAction.Custom}
                disabled={fields.length <= 2} // 至少保留 2 個選項
                onClick={() => remove(index)}
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="w-full flex justify-end mt-3">
          <Button
            variant={Variant.Default}
            action={ButtonAction.Custom}
            onClick={handleAddOption}
          >
            <PlusIcon className="w-4 h-4" />
            Add Option
          </Button>
        </div>
      </div>
      <hr />
    </div>
  )
}
