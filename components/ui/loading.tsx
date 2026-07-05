import { ArrowPathIcon } from "@heroicons/react/24/outline"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
      <ArrowPathIcon className="w-8 h-8 animate-spin text-[#e3d9c6]" />
    </div>
  )
}
