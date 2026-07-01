"use client"

export default function Error() {
  return (
    <div className="flex flex-col items-center justify-content p-24">
      <h1 className="text-3xl font-bold mb-4">Error</h1>
      <p className="text-lg text-muted-foreground">
        An error occurred while loading the page.
      </p>
    </div>
  )
}
