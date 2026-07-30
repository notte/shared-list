import EmptyState from "@/components/ui/EmptyState"

export default function NotFound() {
  return (
    <EmptyState
      imageSrc="/not-found.svg"
      title="Not Found"
      description="The page you are looking for does not exist."
    />
  )
}
