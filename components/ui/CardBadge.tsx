import { CardType } from "@/types/enums"

export interface CardBadgeProps {
  cardType: CardType
}

export default function CardBadge({ cardType }: CardBadgeProps) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full border"
      style={{
        backgroundColor:
          cardType === CardType.Vote
            ? "var(--btn-primary-bg)"
            : cardType === CardType.Announce
              ? "var(--btn-default-bg)"
              : "var(--btn-danger-bg)",
        borderColor:
          cardType === CardType.Vote
            ? "var(--btn-primary-border)"
            : cardType === CardType.Announce
              ? "var(--btn-default-border)"
              : "var(--btn-danger-border)",
        color:
          cardType === CardType.Vote
            ? "var(--btn-primary-text)"
            : cardType === CardType.Announce
              ? "var(--btn-default-text)"
              : "var(--btn-danger-text)",
      }}
    >
      {cardType}
    </span>
  )
}
