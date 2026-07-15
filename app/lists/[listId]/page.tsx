import { getListDetail } from "@/services/db/list"

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
    <div>
      <h1>{listData.title}</h1>
    </div>
  )
}
