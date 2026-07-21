import JoinForm from "@/app/_components/JoinForm"
import { getInviteCodeDetail } from "@/services/db/list"

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  const code = resolvedParams.code

  const inviteItem = await getInviteCodeDetail(code)

  return (
    <div className="w-full h-full p-0 m-0 fixed flex justify-center items-center">
      <div className="flex flex-col justify-center items-center w-full h-fit">
        <h2 className="subheading mb-10">
          <span className="text-clay">{inviteItem?.inviteItem.creator}</span>{" "}
          invited you to join{" "}
          <span className="text-moss">{inviteItem?.inviteItem.title}</span>
        </h2>
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
        <JoinForm
          inviteCode={code}
          title={inviteItem?.inviteItem.title ?? ""}
        />
      </div>
    </div>
  )
}
