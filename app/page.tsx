import CreateListForm from "@/app/_components/CreateListForm"

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center justify-content p-24">
        <section className="flex-col">
          <h1 className="text-3xl font-bold my-4">Landing Page</h1>
          <p className="text-lg text-muted-foreground">
            This is a landing page for the Shared List application.
            <br />
            You can create and share lists with others in real-time.
          </p>
        </section>
        <CreateListForm />
      </main>
    </>
  )
}
