"use client"

import Button from "@/components/ui/Button"
import { useState } from "react"
import { httpClient } from "@/services/http/client"
import { useRouter } from "next/navigation"
import { Variant, ButtonAction } from "@/types/enums"
import { GetCardDetailResponse } from "@/features/cards/adapters/response"

export type VoteCardViewProps = {
  vote: GetCardDetailResponse["vote"]
  listId: string
  cardId: string
}

export default function VoteCardView(props: VoteCardViewProps) {
  const router = useRouter()
  const { vote, listId, cardId } = props!
  const { isMultipleChoice, maxChoices, options } = vote!
  const totalVotes = options.reduce((sum, o) => sum + o.voteCount, 0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelect = (id: string) => {
    if (isMultipleChoice) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((s) => s !== id))
      } else if (selectedIds.length < maxChoices) {
        setSelectedIds([...selectedIds, id])
      }
    } else {
      setSelectedIds(selectedIds.includes(id) ? [] : [id])
    }
  }

  const handleSubmit = async () => {
    await httpClient({
      url: `/api/lists/${listId}/cards/${cardId}/vote`,
      method: "POST",
      payload: { optionIds: selectedIds },
      successMessage: "",
    }).then(() => {
      router.refresh()
    })
  }

  return (
    <div className="w-full space-y-4">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        {isMultipleChoice
          ? `Select up to ${maxChoices} options.`
          : "Select one option."}
      </p>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.voteOptionId)
          const percentage =
            totalVotes > 0
              ? Math.round((option.voteCount / totalVotes) * 100)
              : 0

          return (
            <div
              key={option.voteOptionId}
              className="relative rounded-lg border overflow-hidden cursor-pointer transition-colors duration-200"
              style={{
                borderColor: isSelected
                  ? "var(--btn-primary-border)"
                  : "var(--border)",
                backgroundColor: isSelected
                  ? "var(--btn-primary-bg)"
                  : "var(--surface)",
              }}
              onClick={() => handleSelect(option.voteOptionId)}
            >
              {/* 得票率背景 bar */}
              <div
                className="absolute inset-0 transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: isSelected
                    ? "var(--btn-primary-border)"
                    : "var(--color-sand)",
                  opacity: 0.3,
                }}
              />

              {/* 選項內容 */}
              <div className="relative flex justify-between items-center px-4 py-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {option.text}
                </span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {percentage}% · {option.voteCount} votes
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-right" style={{ color: "var(--muted)" }}>
        Total votes: {totalVotes}
      </p>
      <hr />
      <div className="flex justify-end">
        <Button
          variant={selectedIds.length > 0 ? Variant.Primary : Variant.Default}
          action={ButtonAction.Submit}
          onClick={handleSubmit}
          buttonText="Submit Vote"
        />
      </div>
    </div>
  )
}
