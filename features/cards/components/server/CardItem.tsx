import Button from "@/components/ui/Button"
import { Variant, ButtonAction } from "@/types/enums"
import { Card as CardItemProps } from "@/features/cards/schemas/card.schema"

export default function CardItem({
  title,
  description,
  createdAt,
  createdBy,
}: CardItemProps) {
  return (
    <div className="card-container">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="text-sm text-stone flex items-end gap-3">
          <p className="border-r pr-3">Created by: {createdBy?.userName}</p>
          <p>Created: {createdAt?.toLocaleDateString("zh-TW")}</p>
        </div>
      </div>
      <p className="mb-4 line-clamp-2 text-sm">{description}</p>
      <Button
        buttonText="read more"
        variant={Variant.Primary}
        action={ButtonAction.Navigate}
      />
    </div>
  )
}
