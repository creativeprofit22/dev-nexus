/**
 * EditorToolbar Component
 * Toolbar for Tiptap editor with formatting buttons
 */

import { Button } from "@/shared/components/ui/Button";
import type { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor;
  disabled?: boolean;
}

export function EditorToolbar({ editor, disabled }: EditorToolbarProps) {
  const toolbarButton = (
    isActive: boolean,
    onClick: () => void,
    label: string
  ) => (
    <Button
      type="button"
      variant={isActive ? "primary" : "secondary"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 rounded-lg border border-[#212730] bg-[#14161c]">
      {toolbarButton(
        editor.isActive("heading", { level: 1 }),
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        "H1"
      )}
      {toolbarButton(
        editor.isActive("heading", { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        "H2"
      )}
      {toolbarButton(
        editor.isActive("heading", { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        "H3"
      )}
      <div className="w-px h-8 bg-[#212730] mx-1" />
      {toolbarButton(
        editor.isActive("bold"),
        () => editor.chain().focus().toggleBold().run(),
        "Bold"
      )}
      {toolbarButton(
        editor.isActive("italic"),
        () => editor.chain().focus().toggleItalic().run(),
        "Italic"
      )}
      <div className="w-px h-8 bg-[#212730] mx-1" />
      {toolbarButton(
        editor.isActive("bulletList"),
        () => editor.chain().focus().toggleBulletList().run(),
        "Bullets"
      )}
      {toolbarButton(
        editor.isActive("orderedList"),
        () => editor.chain().focus().toggleOrderedList().run(),
        "Numbers"
      )}
      {toolbarButton(
        editor.isActive("codeBlock"),
        () => editor.chain().focus().toggleCodeBlock().run(),
        "Code"
      )}
    </div>
  );
}
