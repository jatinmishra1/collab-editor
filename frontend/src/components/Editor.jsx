import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

function ToolbarButton({ onClick, active, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor losing focus
        onClick();
      }}
      className={`px-2 py-1 rounded text-sm font-medium border transition select-none
        ${active
          ? "bg-indigo-600 text-white border-indigo-700"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
        }`}
    >
      {children}
    </button>
  );
}

function MenuBar({ editor }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
      >
        <span style={{ textDecoration: "underline" }}>U</span>
      </ToolbarButton>

      <span className="border-l border-gray-300 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        H3
      </ToolbarButton>

      <span className="border-l border-gray-300 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        ❝
      </ToolbarButton>

      <span className="border-l border-gray-300 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        active={false}
      >
        ↩
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        active={false}
      >
        ↪
      </ToolbarButton>
    </div>
  );
}

export default function Editor({ content, onChange, readOnly }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content || "<p>Start writing...</p>",
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  // Sync content from parent on initial load (content starts as "" then gets set)
  useEffect(() => {
    if (!editor || !content) return;
    // Only update if content differs, to avoid infinite loops
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, false /* don't emit update */);
    }
  }, [content, editor]);

  // Sync readOnly prop changes
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [readOnly, editor]);

  return (
    <div className="flex flex-col h-full">
      {!readOnly && <MenuBar editor={editor} />}
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="p-6 min-h-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
        />
      </div>
    </div>
  );
}
