import EmptyState from "@/components/ui/EmptyState"

export default function Page() {
  return (
    <EmptyState
      imageSrc="/forbidden.svg"
      title="Access Denied"
      description="You do not have permission to access this page."
    />
  )
}
