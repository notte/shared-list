"use client"
import React from "react"
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  Description,
  DialogProps as HeadlessDialogProps,
} from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/solid"

import Button from "@/components/ui/Button"
import { Variant, DialogRole, Size } from "@/types/enums"
import Icon from "./Icon"

export interface DialogProps extends Omit<HeadlessDialogProps, "onClose"> {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  role: DialogRole
  description?: string
  children?: React.ReactNode
}

export default function Dialog({
  title,
  description,
  open,
  onClose,
  onConfirm,
  role,
  children,
}: DialogProps) {
  const handleOnClose = () => {
    if (onClose) onClose()
  }

  const handleOnConfirm = () => {
    if (onConfirm) onConfirm()
  }

  return (
    <HeadlessDialog open={open} onClose={handleOnClose}>
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
              <Button variant={Variant.Icon} onClick={handleOnClose}>
                <Icon Variant={Variant.Primary} size={Size.Large}>
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
                  onClick={handleOnClose}
                  buttonText="Cancel"
                  variant={Variant.Danger}
                />
                <Button
                  onClick={handleOnConfirm}
                  buttonText="Deactivate"
                  variant={Variant.Primary}
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
