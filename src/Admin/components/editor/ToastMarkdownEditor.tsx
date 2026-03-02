import { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";

type ToastMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  placeholder?: string;
};

const ToastMarkdownEditor = ({
  value,
  onChange,
  minHeight = 440,
  placeholder = "Write your content here...",
}: ToastMarkdownEditorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dark = document.documentElement.classList.contains("dark");
    const editor = new Editor({
      el: container,
      height: "auto",
      minHeight: `${minHeight}px`,
      initialEditType: "wysiwyg",
      previewStyle: "tab",
      initialValue: value ?? "",
      usageStatistics: false,
      placeholder,
      theme: dark ? "dark" : undefined,
      hideModeSwitch: true,
      toolbarItems: [
        ["heading", "bold", "italic", "strike"],
        ["hr", "quote"],
        ["ul", "ol", "task"],
        ["table", "image", "link"],
        ["code", "codeblock"],
      ],
    });

    editor.on("change", () => {
      onChangeRef.current(editor.getMarkdown());
    });

    editorRef.current = editor;

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [minHeight, placeholder]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const current = editor.getMarkdown();
    if (current !== (value ?? "")) {
      editor.setMarkdown(value ?? "", false);
    }
  }, [value]);

  return (
    <div className="toast-markdown-editor overflow-hidden rounded-xl border border-[var(--border-1)]">
      <div ref={containerRef} />
    </div>
  );
};

export default ToastMarkdownEditor;
