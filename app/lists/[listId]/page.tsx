import { getListDetail } from "@/services/db/list"
import CardForm from "@/features/cards/components/client/CardForm"

interface PageProps {
  params: Promise<{ listId: string }>
}

export default async function Page({ params }: PageProps) {
  // 強型別 await 解析
  const resolvedParams = await params

  // 印出完整的物件，確認 Key 值大小寫是否與資料夾 [listId] 完全吻合
  console.log("Next.js 傳入的 resolvedParams 物件:", resolvedParams)

  const listId = resolvedParams.listId

  if (!listId) return <div>無效的清單路徑</div>

  const listData = await getListDetail(listId)
  if (!listData) return <>The list does not exist.</>

  return (
    <>
      <div className="w-full flex flex-col m-0 p-0 items-center justify-center">
        <div className="w-1/2 flex flex-col mb-6">
          <h2 className="subheading">Create Card</h2>
          <h3 className="section-title">
            Share an update, plan an event, or start a vote — all in one place.
          </h3>
        </div>
        <CardForm />
      </div>
    </>
  )
}
