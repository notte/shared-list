import Image from "next/image"

export default function Page() {
  return (
    <div className="w-screen h-screen p-0 m-0 flex justify-center items-center">
      <div className="flex flex-col items-center justify-center h-120">
        <Image
          src="/forbidden.svg"
          alt="Hero Image"
          width={200}
          height={100}
          className="mb-4"
          priority
        />
        <h2 className="subheading mb-4">Access Denied</h2>
        <h3 className="section-title">
          You do not have permission to access this page.
        </h3>
      </div>
    </div>
  )
}
