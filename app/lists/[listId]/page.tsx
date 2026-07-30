import EmptyState from "@/components/ui/EmptyState"
import CardItem from "@/features/cards/components/server/CardItem"
import { getListCards } from "@/services/db/card"
import { getUserDataServer } from "@/services/storage/user.server"
import { redirect, notFound } from "next/navigation"
import { getListDetail, checkUserInList } from "@/services/db/list"

interface PageProps {
  params: Promise<{ listId: string }>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const listId = resolvedParams.listId

  const userData = await getUserDataServer()
  const listData = await getListDetail(listId)
  const isMember = await checkUserInList(listId)

  if (!userData || !userData?.userId || !isMember) redirect("/forbidden")

  const cardList = await getListCards(listId, userData?.userId)

  if (!cardList || !listId || !listData) notFound()

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
        <EmptyState
          imageSrc="/no-data.svg"
          title="No cards yet."
          description="Cards will appear here once they are published."
        />
      )}
    </>
  )
}
