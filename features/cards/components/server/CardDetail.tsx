import CardBadge from "@/components/ui/CardBadge"
import { GetCardDetailResponse } from "@/features/cards/adapters/response"
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import { dateOptions } from "@/lib/utils"
import { formatForDisplay } from "@/lib/date"

export interface CardDetailProps {
  card: GetCardDetailResponse
  children?: React.ReactNode
}

export default function CardDetail({ card, children }: CardDetailProps) {
  return (
    <div className="card-container w-full max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CardBadge cardType={card.cardType} />
        </div>
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--color-ink)" }}
        >
          {card.title}
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {card.description}
        </p>
      </div>

      <hr />

      {/* ─── Meta ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--muted)" }}
        >
          <UserIcon className="w-4 h-4 shrink-0" />
          <span>{card.createdBy.userName}</span>
        </div>
        {card.address && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <MapPinIcon className="w-4 h-4 shrink-0" />
            <span>{card.address}</span>
          </div>
        )}
        {card.eventTime && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span>
              Event：
              {formatForDisplay(card.eventTime)}
            </span>
          </div>
        )}
        {card.eventStartTime && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span>
              Event Start：
              {formatForDisplay(card.eventStartTime)}
            </span>
          </div>
        )}
        {card.eventEndTime && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span>
              Event End：
              {formatForDisplay(card.eventEndTime)}
            </span>
          </div>
        )}
        {card.publishTime && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span>
              Publish：
              {formatForDisplay(card.publishTime)}
            </span>
          </div>
        )}
        {card.endTime && (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--muted)" }}
          >
            <ClockIcon className="w-4 h-4 shrink-0" />
            <span>
              Ends：
              {new Date(card.endTime).toLocaleString("en-US", dateOptions)}
            </span>
          </div>
        )}
      </div>

      <hr />

      {/* ─── Content ─────────────────────────────────── */}
      <div
        className="tiptap"
        dangerouslySetInnerHTML={{ __html: card.content }}
      />

      {/* ─── Vote（留空位）───────────────────────────── */}
      <>
        <hr />
        {children}
      </>
    </div>
  )
}
