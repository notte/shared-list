"use client"

import { Button as HeadlessButton } from "@headlessui/react"
import { Variant, ButtonAction } from "@/types/enums"
import { useRouter } from "next/navigation"

export interface ButtonProps {
  disabled?: boolean
  variant: Variant
  buttonText?: string
  children?: React.ReactNode
  onClick?: () => void
  action?: ButtonAction
  path?: string
}

export default function Button({
  disabled,
  buttonText,
  children,
  variant,
  onClick,
  action,
  path,
}: ButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) onClick()
    if (action === ButtonAction.Navigate && path) router.push(path)
  }

  return (
    <HeadlessButton
      disabled={disabled}
      onClick={handleClick}
      className={`btn btn-${variant}`}
      type={action === ButtonAction.Submit ? "submit" : "button"}
    >
      {variant === Variant.Icon ? (
        children
      ) : (
        <div className={`flex justify-center items-center gap-1`}>
          {children}
          {buttonText}
        </div>
      )}
    </HeadlessButton>
  )
}
