"use client"

import StarterKit from "@tiptap/starter-kit"
import Button from "@/components/ui/Button"
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  XMarkIcon,
  ListBulletIcon,
  NumberedListIcon,
  ChatBubbleLeftIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline"
import {
  useEditor,
  EditorContent,
  useEditorState,
  EditorStateSnapshot,
} from "@tiptap/react"
import { Editor } from "@tiptap/core"
import { Variant, ButtonAction } from "@/types/enums"
import { useEffect } from "react"

const menuBarStateSelector = (ctx: EditorStateSnapshot) => ({
  isBold: ctx.editor?.isActive("bold") ?? false,
  isItalic: ctx.editor?.isActive("italic") ?? false,
  isStrike: ctx.editor?.isActive("strike") ?? false,
  isCode: ctx.editor?.isActive("code") ?? false,
  isParagraph: ctx.editor?.isActive("paragraph") ?? false,
  isHeading1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
  isHeading2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
  isHeading3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
  isHeading4: ctx.editor?.isActive("heading", { level: 4 }) ?? false,
  isHeading5: ctx.editor?.isActive("heading", { level: 5 }) ?? false,
  isHeading6: ctx.editor?.isActive("heading", { level: 6 }) ?? false,
  isBulletList: ctx.editor?.isActive("bulletList") ?? false,
  isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
  isCodeBlock: ctx.editor?.isActive("codeBlock") ?? false,
  isBlockquote: ctx.editor?.isActive("blockquote") ?? false,
})

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const editorState = useEditorState({ editor, selector: menuBarStateSelector })

  if (!editor) return null

  return (
    <div className="tiptap-menu">
      {/* 文字格式 */}
      <Button
        variant={editorState?.isBold ? Variant.Primary : Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={editorState?.isItalic ? Variant.Primary : Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={editorState?.isStrike ? Variant.Primary : Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikethroughIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      >
        <XMarkIcon className="w-4 h-4" />
      </Button>

      {/* 標題 */}
      {([1, 2, 3] as const).map((level) => (
        <Button
          key={level}
          variant={
            editorState?.[`isHeading${level}`]
              ? Variant.Primary
              : Variant.Default
          }
          action={ButtonAction.Custom}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          H{level}
        </Button>
      ))}

      {/* 清單 */}
      <Button
        variant={editorState?.isBulletList ? Variant.Primary : Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListBulletIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={editorState?.isOrderedList ? Variant.Primary : Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <NumberedListIcon className="w-4 h-4" />
      </Button>

      {/* 其他 */}
      <Button
        variant={editorState?.isBlockquote ? Variant.Primary : Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <ChatBubbleLeftIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <ArrowUturnLeftIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={Variant.Default}
        action={ButtonAction.Custom}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <ArrowUturnRightIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}

export interface TiptapProps {
  value: string
  onChange: (value: string) => void
  errorText?: string
}

const Tiptap = ({ value, onChange, errorText }: TiptapProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value, // 初始化內容
    onUpdate: ({ editor }) => {
      // 當編輯器內容改變時，觸發外部的 onChange
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <>
      <label className="input-label">Content</label>
      <p className="input-description">
        Detailed description with text formatting.
      </p>
      <div className="w-full mb-4 border border-border rounded-xl overflow-hidden">
        <MenuBar editor={editor} />
        <EditorContent
          className="p-4 bg-surface overflow-y-auto"
          editor={editor}
        />
      </div>
      <p className="input-error">{errorText}</p>
    </>
  )
}

export default Tiptap
