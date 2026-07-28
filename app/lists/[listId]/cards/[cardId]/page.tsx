import ReadStatusController from "@/features/cards/components/client/ReadStatusController"
import VoteCardView from "@/features/cards/components/client/VoteCardView"
import CardDetail from "@/features/cards/components/server/CardDetail"
import { getCardDetail } from "@/services/db/card"
import { CardType } from "@/types/enums"
import { getUserDataServer } from "@/services/storage/user.server"

interface PageProps {
  params: Promise<{ listId: string; cardId: string }>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const listId = resolvedParams.listId
  const cardId = resolvedParams.cardId

  const userData = await getUserDataServer()

  if (!listId || !cardId) return <>Invalid page URL.</>

  const cardDetailData = await getCardDetail(listId, cardId)

  if (!cardDetailData) return <>Card not found.</>

  console.log(cardDetailData)
  return (
    <CardDetail card={cardDetailData}>
      {cardDetailData.cardType === CardType.Vote && cardDetailData.vote && (
        <VoteCardView
          vote={cardDetailData.vote}
          listId={listId}
          cardId={cardId}
        />
      )}
      {cardDetailData.cardType === CardType.Announce && (
        <ReadStatusController
          listId={listId}
          cardId={cardId}
          isRead={cardDetailData.readBy.includes(userData?.userId ?? "")}
        />
      )}
    </CardDetail>
  )
}
