import { getListDetail } from "@/services/db/list"
import NavLeft from "@/app/_components/NavLeft"
import NavRight from "@/app/_components/NavRight"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ listId: string }>
}) {
  const { listId } = await params

  if (!listId) return <div>Invalid list path.</div>
  const listData = await getListDetail(listId)
  if (!listData) return <>The list does not exist.</>

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center bg-background p-10">
        <div className="flex-1">
          <NavLeft listId={listId} />
        </div>
        <div className="flex-5">
          <h1 className="text-5xl font-bold text-clay text-center line-clamp-1">
            {listData.title}
          </h1>
        </div>
        <div className="flex-1 flex justify-end items-end">
          <NavRight listId={listId} listData={listData} />
        </div>
      </nav>
      <div className="flex-1 mt-32 h-[calc(100vh-8rem)] flex justify-center items-center flex-col">
        {children}
      </div>
    </div>
  )
}
