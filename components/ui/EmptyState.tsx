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
      <div className="w-50 h-50 relative mb-4">
        <Image
          src={imageSrc}
          alt="Hero Image"
          fill
          className="object-contain"
          priority
          unoptimized
        />
      </div>
      <h2 className="subheading mb-4">{title}</h2>
      <h3 className="section-title">{description}</h3>
    </div>
  )
}
