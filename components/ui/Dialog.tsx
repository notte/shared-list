"use client"

import React, { useState } from "react"
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  Description,
  DialogProps as HeadlessDialogProps,
} from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/solid"

import Button from "@/components/ui/Button"
import { EventType, DialogRole, Size } from "@/types/state"
import Icon from "./Icon"

export interface DialogProps extends Omit<HeadlessDialogProps, "onClose"> {
  open: boolean
  title: string
  role: DialogRole
  description?: string
  onClose?: () => void
  children?: React.ReactNode
}

export default function Dialog({
  title,
  description,
  open,
  role,
  children,
}: DialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(open)

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <HeadlessDialog open={isOpen} onClose={() => {}}>
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-ink/80 dark:bg-sand/50">
        <DialogPanel
          className={
            role === DialogRole.AlertDialog
              ? "alert-dialog-wrapper"
              : "dialog-wrapper"
          }
        >
          <DialogTitle className="flex justify-between items-center">
            <div className="text-xl font-bold">{title}</div>
            {role === DialogRole.Dialog && (
              <Button
                variant={EventType.Icon}
                disabled={false}
                onClick={onClose}
              >
                <Icon eventType={EventType.Primary} size={Size.Large}>
                  <XMarkIcon />
                </Icon>
              </Button>
            )}
          </DialogTitle>
          {role === DialogRole.AlertDialog && (
            <>
              <Description>{description}</Description>
              <div className="flex gap-4">
                <Button
                  onClick={onClose}
                  buttonText="Cancel"
                  variant={EventType.Danger}
                />
                <Button
                  onClick={onClose}
                  buttonText="Deactivate"
                  variant={EventType.Primary}
                />
              </div>
            </>
          )}
          {children}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  )
}
