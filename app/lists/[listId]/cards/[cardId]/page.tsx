import ReadStatusController from "@/features/cards/components/client/ReadStatusController"
import VoteCardView from "@/features/cards/components/client/VoteCardView"
import CardDetail from "@/features/cards/components/server/CardDetail"
import { getCardDetail } from "@/services/db/card"
import { CardType } from "@/types/enums"
import { getUserDataServer } from "@/services/storage/user.server"
import { checkUserInList } from "@/services/db/list"
import { redirect, notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ listId: string; cardId: string }>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const listId = resolvedParams.listId
  const cardId = resolvedParams.cardId

  const userData = await getUserDataServer()
  const isMember = await checkUserInList(listId)
  const cardDetailData = await getCardDetail(listId, cardId)

  if (!isMember) redirect("/forbidden")
  if (!listId || !cardId || !cardDetailData) notFound()

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
