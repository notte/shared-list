import VoteCardView from "@/features/cards/components/client/VoteCardView"
import { Vote } from "@/features/cards/schemas/card.schema"
import { getListDetail } from "@/services/db/list"

interface PageProps {
  params: Promise<{ listId: string; cardId: string }>
}

const MOCK_VOTE: Vote = {
  isMultipleChoice: true,
  maxChoices: 2,
  options: [
    { voteOptionId: "1", text: "Option A", voteCount: 5 },
    { voteOptionId: "2", text: "Option B", voteCount: 3 },
    { voteOptionId: "3", text: "Option C", voteCount: 2 },
  ],
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const listId = resolvedParams.listId
  const cardId = resolvedParams.cardId
  if (!listId) return <>Invalid list path.</>

  const listData = await getListDetail(listId)
  if (!listData) return <>The list does not exist.</>

  return (
    <div className="w-1/2">
      <VoteCardView {...MOCK_VOTE} listId={listId} cardId={cardId} />
    </div>
  )
}
