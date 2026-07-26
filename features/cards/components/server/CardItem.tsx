import Button from "@/components/ui/Button"
import { Variant, ButtonAction } from "@/types/enums"
import { SerializedCardSummary } from "@/features/cards/adapters/response"
import { dateOptions } from "@/lib/utils"

export interface CardItemProps extends SerializedCardSummary {
  listId: string
}

export default function CardItem({
  listId,
  cardId,
  cardType,
  title,
  description,
  createdBy,
  readBy,
  createdAt,
}: CardItemProps) {
  const handle = () => {}

  return (
    <div className="card-container">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="text-sm text-stone flex items-end gap-3">
          <p className="border-r pr-3">Created by: {createdBy?.userName}</p>
          <p>
            Created: {new Date(createdAt).toLocaleString("en-US", dateOptions)}
          </p>
        </div>
      </div>
      <p className="mb-4 line-clamp-2 text-sm">{description}</p>
      <Button
        buttonText="read more"
        variant={Variant.Primary}
        action={ButtonAction.Navigate}
        path={`/lists/${listId}/cards/${cardId}`}
      />
    </div>
  )
}
