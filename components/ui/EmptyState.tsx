import Image from "next/image"

interface EmptyStateProps {
  imageSrc: string
  title: string
  description: string
}

export default function EmptyState({
  imageSrc,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-120">
      <Image
        src={imageSrc}
        alt="Hero Image"
        width={200}
        height={100}
        className="mb-4"
        priority
      />
      <h2 className="subheading mb-4">{title}</h2>
      <h3 className="section-title">{description}</h3>
    </div>
  )
}
