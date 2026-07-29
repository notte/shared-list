import CreateListForm from "@/features/lists/components/client/CreateListForm"

export default function Home() {
  return (
    <>
      <main className="w-full flex flex-col items-center justify-center p-24">
        <section className="flex-col w-1/2">
          <h1 className="text-5xl font-bold text-clay text-center line-clamp-1 mb-4">
            Landing Page
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            This is a landing page for the Shared List application.
            <br />
            You can create and share lists with others in real-time.
          </p>
          <CreateListForm />
        </section>
      </main>
    </>
  )
}
