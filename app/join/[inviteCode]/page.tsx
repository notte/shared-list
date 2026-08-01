import JoinForm from "@/features/lists/components/client/JoinForm"
import { getInviteCodeDetail } from "@/services/db/list"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ inviteCode: string }>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const inviteCode = resolvedParams.inviteCode

  const inviteItem = await getInviteCodeDetail(inviteCode)

  if (!inviteItem) return notFound()

  return (
    <div className="w-full flex flex-col items-center justify-center p-24">
      <section className="flex justify-center items-center flex-col w-1/2">
        <h1 className="text-3xl font-bold text-clay text-center line-clamp-1 mb-10">
          <span className="text-clay">{inviteItem?.creator}</span> invited you
          to join <span className="text-moss">{inviteItem?.title}</span>
        </h1>
        <div className="alert-wrapper">
          <h3 className="section-title">
            🔔 Quick Access (No Account Required)
          </h3>
          <p>
            Your access pass is securely saved in this browser. <br />
            Please note that clearing your browser history or site data will
            remove your ID, and you may lose access to this list.
          </p>
        </div>
        <JoinForm inviteCode={inviteCode} title={inviteItem?.title ?? ""} />
      </section>
    </div>
  )
}
