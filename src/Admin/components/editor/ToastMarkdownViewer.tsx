import { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

type ToastMarkdownViewerProps = {
  value: string;
};

const ToastMarkdownViewer = ({ value }: ToastMarkdownViewerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dark = document.documentElement.classList.contains("dark");
    const viewer = Editor.factory({
      el: container,
      initialValue: value || "",
      usageStatistics: false,
      viewer: true,
      theme: dark ? "dark" : undefined,
    });

    viewerRef.current = viewer;

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setMarkdown(value || "");
  }, [value]);

  return <div className="rounded-xl border border-[var(--border-1)] bg-[var(--surface-1)] p-4" ref={containerRef} />;
};

export default ToastMarkdownViewer;
