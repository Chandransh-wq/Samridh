import {
  useEditor,
  EditorContent,
  Editor as TiptapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import HardBreak from "@tiptap/extension-hard-break";
import { Markdown } from "@tiptap/markdown";
import React, { useEffect, useRef } from "react";

/**
 * 1. TypeScript Augmentation
 * This tells TS that the 'getMarkdown' method exists on the Editor instance.
 */

/**
 * 2. Custom Extension
 * Handles 'Enter' to insert <br /> in paragraphs, but keeps standard block
 * behavior for Headings and Lists.
 */
const CustomHardBreak = HardBreak.extend({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        if (
          this.editor.isActive("heading") ||
          this.editor.isActive("bulletList") ||
          this.editor.isActive("orderedList")
        ) {
          return false;
        }
        return this.editor.commands.setHardBreak();
      },
    };
  },
});

interface editorProps {
  content: string;
  setContent: (text: string) => void;
  saveContent: () => void;
  setEditingContent: (state: boolean) => void;
  // Updated: Pass the editor instance to the parent for coordinate calculation
  handleSelect: (editor: TiptapEditor) => void;
}

const Editor: React.FC<editorProps> = ({
  content,
  setContent,
  saveContent,
  setEditingContent,
  handleSelect,
}) => {
  // Use a Ref to avoid "Stale Closures" in the useEditor hook
  const handleSelectRef = useRef(handleSelect);

  useEffect(() => {
    handleSelectRef.current = handleSelect;
  }, [handleSelect]);

  /**
   * Pre-process content to ensure Markdown headers are followed by double newlines.
   * This prevents Tiptap from merging headers and paragraphs into one block.
   */
  const formattedContent = React.useMemo(() => {
    return content.replace(/(^#{1,6}\s+.+?)(\n)(?!\n)/gm, "$1\n\n");
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false, // Disabled in favor of CustomHardBreak
      }),
      CustomHardBreak,
      Markdown.configure({
        markedOptions: {
          gfm: true,
          breaks: true,
        },
      }),
    ],
    contentType: "markdown",
    content: formattedContent,
    immediatelyRender: false,
    autofocus: "end",

    onUpdate: ({ editor }) => {
      setContent(editor.getMarkdown());
    },

    onBlur: () => {
      saveContent();
    },

    // Triggers whenever the selection (highlight or cursor) changes
    onSelectionUpdate: ({ editor }) => {
      if (typeof handleSelectRef.current === "function") {
        handleSelectRef.current(editor);
      }
    },

    editorProps: {
      attributes: {
        class: [
          "prose max-w-none focus:outline-none flex flex-col gap-5",
          "max-h-[60vh] min-h-[75vh] overflow-auto mynewscrollbar",
          "whitespace-pre-wrap border-none",
          "prose-p:my-5 prose-headings:my-0 prose-li:my-5", // Vertical spacing handled by 'gap-5'
        ].join(" "),
      },
      handleKeyDown: (_view, event) => {
        // Ctrl+Enter or Cmd+Enter to save
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          saveContent();
          return true;
        }
        // Escape to cancel editing
        if (event.key === "Escape") {
          setEditingContent(false);
          return true;
        }
        return false;
      },
    },
  });

  return (
    <div className="border-none rounded-md bg-white">
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
