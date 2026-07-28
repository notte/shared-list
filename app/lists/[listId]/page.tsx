import EmptyState from "@/components/ui/EmptyState"
import CardItem from "@/features/cards/components/server/CardItem"
import { getListCards } from "@/services/db/card"
import { getUserDataServer } from "@/services/storage/user.server"

interface PageProps {
  params: Promise<{ listId: string }>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const listId = resolvedParams.listId

  if (!listId) return <>Invalid list path.</>

  const userData = await getUserDataServer()

  if (!userData || !userData?.userId) return <>Invalid user.</>
  const cardList = await getListCards(listId, userData?.userId)
  if (!cardList) return <>Failed to load cards. Please try again later.</>

  return (
    <>
      {cardList.count > 0 ? (
        cardList.cards
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map((card) => {
            return <CardItem key={card.cardId} listId={listId} {...card} />
          })
      ) : (
        <EmptyState />
      )}
    </>
  )
}
