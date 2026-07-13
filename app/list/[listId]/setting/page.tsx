"use client"
import CardForm from "@/features/cards/components/client/CardForm"
import Dialog from "@/components/ui/Dialog"
import { useState } from "react"
import { EventType, DialogRole } from "@/types/enums"
import Button from "@/components/ui/Button"

export default function Page() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <h1>Edit Card</h1>
      <Button
        onClick={() => setIsOpen(true)}
        buttonText="開啟"
        variant={EventType.Primary}
      />

      <Dialog
        open={isOpen}
        title="確認刪除"
        role={DialogRole.AlertDialog}
        description="此操作無法還原，確定要刪除嗎？"
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          // 執行刪除邏輯
          setIsOpen(false)
        }}
      />
      <CardForm />
    </>
  )
}
