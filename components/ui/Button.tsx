"use client"

import { Button as HeadlessButton } from "@headlessui/react"
import { EventType, ButtonAction } from "@/types/state"

export interface ButtonProps {
  disabled?: boolean
  variant: EventType
  buttonText?: string
  children?: React.ReactNode
  onClick?: () => void
  action?: ButtonAction
}

export default function Button({
  disabled,
  buttonText,
  children,
  variant,
  onClick,
  action,
}: ButtonProps) {
  const handleClick = () => {
    if (onClick) onClick()

    switch (action) {
      case ButtonAction.Navigate:
        break
      case ButtonAction.Submit:
        break
      default:
        break
    }
  }

  return (
    <HeadlessButton
      disabled={disabled}
      onClick={handleClick}
      className={`btn btn-${variant}`}
    >
      {buttonText || children}
    </HeadlessButton>
  )
}
