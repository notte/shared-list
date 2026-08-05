import { Fraunces } from "next/font/google"
import CreateListForm from "@/features/lists/components/client/CreateListForm"

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
})

const pinnedNotes = [
  {
    pin: "#c84b31",
    title: "Announcements",
    description: "Post updates with a time, a place, and read receipts.",
    rotate: "-rotate-2",
  },
  {
    pin: "#2b5c8f",
    title: "Polls",
    description: "Ask a question and watch the votes land live.",
    rotate: "rotate-1",
  },
  {
    pin: "#3b7a57",
    title: "One link",
    description: "Anyone with the link can join — no account needed.",
    rotate: "-rotate-1",
  },
]

export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden flex items-center justify-center px-6 py-20 md:py-24">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-5xl grid gap-16 md:grid-cols-[1.1fr_1fr] md:items-center">
        <section className="flex flex-col items-start text-left">
          <span className="inline-block -rotate-1 rounded border border-dashed border-clay px-3 py-1 text-xs font-mono tracking-widest text-muted uppercase">
            No sign-up · Just a link
          </span>

          <h1
            className={`${fraunces.className} mt-6 text-4xl md:text-5xl font-semibold leading-tight text-ink`}
          >
            A corkboard for
            <br />
            your group.
          </h1>

          <p className="mt-4 max-w-md text-lg text-muted">
            Start a list, share the link, and pin announcements or polls
            everyone can see — together, in real time.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {pinnedNotes.map((note) => (
              <div
                key={note.title}
                className={`group relative w-40 rounded-lg border border-border bg-[var(--surface)] px-4 pt-5 pb-3 shadow-sm transition-transform duration-200 hover:rotate-0 ${note.rotate}`}
              >
                <span
                  className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full shadow-sm"
                  style={{ backgroundColor: note.pin }}
                />
                <p className="text-sm font-semibold text-ink">{note.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {note.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex justify-center">
          <div className="relative w-full max-w-sm -rotate-1 rounded-xl border border-border bg-[var(--surface)] p-8 shadow-lg transition-transform duration-300 hover:rotate-0">
            <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-rust shadow-md" />

            <h2
              className={`${fraunces.className} text-xl font-semibold text-ink`}
            >
              Start a board
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted">
              Name it, add yourself, and you&apos;re in.
            </p>

            <CreateListForm />
          </div>
        </section>
      </div>
    </main>
  )
}
