import Button from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import CardBadge from "@/components/ui/CardBadge"
import EditCardDialog from "../client/EditCardDialog"
import { Variant, ButtonAction, Size, CardType } from "@/types/enums"
import { SerializedCardSummary } from "@/features/cards/adapters/response"
import { getUserDataServer } from "@/services/storage/user.server"
import { EnvelopeIcon, EnvelopeOpenIcon } from "@heroicons/react/24/outline"
import { formatForDisplay } from "@/lib/date"

export interface CardItemProps extends SerializedCardSummary {
  listId: string
}

export default async function CardItem({
  listId,
  cardId,
  title,
  description,
  createdBy,
  readBy,
  createdAt,
  cardType,
  publishTime,
  endTime,
}: CardItemProps) {
  const userData = await getUserDataServer()
  const isCreator = createdBy.userId === userData?.userId
  const isRead = userData?.userId ? readBy.includes(userData.userId) : false
  const isEnd = new Date(endTime).toISOString() < new Date().toISOString()

  return (
    <div className={`card-container ${isEnd ? "bg-sand" : null}`}>
      <div className="mb-2 flex gap-1">
        <CardBadge cardType={cardType} />
        {isEnd && <CardBadge cardType={CardType.Closed} />}
      </div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="text-sm text-stone flex items-end gap-3">
          <p className="border-r pr-3">Created by: {createdBy?.userName}</p>
          <p>Created: {formatForDisplay(createdAt)}</p>
        </div>
      </div>
      <p className="mb-4 line-clamp-2 text-sm">{description}</p>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            buttonText="read more"
            variant={Variant.Primary}
            action={ButtonAction.Navigate}
            path={`/lists/${listId}/cards/${cardId}`}
          />
          {/* 編輯按鈕：尚未到達公開時間，並且是建立者 */}
          {isCreator &&
            publishTime &&
            new Date().getTime() < new Date(publishTime).getTime() && (
              <EditCardDialog listId={listId} cardId={cardId} />
            )}
        </div>
        <Icon
          variant={isRead ? Variant.Success : Variant.Danger}
          size={Size.Small}
        >
          {cardType === CardType.Announce &&
            (isRead ? (
              <EnvelopeOpenIcon className="w-4 h-4" />
            ) : (
              <EnvelopeIcon className="w-4 h-4" />
            ))}
        </Icon>
      </div>
    </div>
  )
}
