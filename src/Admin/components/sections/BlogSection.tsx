import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { uploadAdminFile } from "../../adminService";
import ToastMarkdownEditor from "../editor/ToastMarkdownEditor";
import ToastMarkdownViewer from "../editor/ToastMarkdownViewer";
import {
  createAdminBlog,
  deleteAdminBlog,
  getAdminBlogById,
  getAdminBlogs,
  updateAdminBlog,
} from "../../../blog/blogService";
import type { BlogPostStatus, BlogPostUpsertRequest } from "../../../blog/types";
import type { ConfirmAction } from "./types";

const createEmptyPost = (): BlogPostUpsertRequest => ({
  title: "",
  topic: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: [],
  status: "DRAFT",
});

const formatDate = (value: string | null) => {
  if (!value) return "Not published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
};

const statusClass = (status: BlogPostStatus) =>
  status === "PUBLISHED"
    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
    : "bg-amber-100 text-amber-700 border border-amber-300";

interface BlogSectionProps {
  confirmAction: ConfirmAction;
}

const BlogSection: React.FC<BlogSectionProps> = ({ confirmAction }) => {
  const BLOG_POST_QUERY_KEY = "blogPostId";
  const [posts, setPosts] = useState<
    Array<{
      id: number;
      title: string;
      topic: string;
      excerpt: string;
      coverImage: string;
      tags: string[];
      status: BlogPostStatus;
      likeCount: number;
      shareCount: number;
      commentCount: number;
      publishedAt: string | null;
      updatedAt: string;
    }>
  >([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [form, setForm] = useState<BlogPostUpsertRequest>(createEmptyPost());
  const [savedForm, setSavedForm] = useState<BlogPostUpsertRequest>(createEmptyPost());
  const [tagsInput, setTagsInput] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const excerptInputRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResizeExcerpt = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const loadPosts = async () => {
    const response = await getAdminBlogs();
    setPosts(response);
    return response;
  };

  const setSelectedPostInUrl = (id: number | null) => {
    const params = new URLSearchParams(window.location.search);
    if (id === null) {
      params.delete(BLOG_POST_QUERY_KEY);
    } else {
      params.set(BLOG_POST_QUERY_KEY, String(id));
    }
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const response = await loadPosts();
        const fromUrl = Number(new URLSearchParams(window.location.search).get(BLOG_POST_QUERY_KEY));
        if (!Number.isFinite(fromUrl)) return;
        const exists = response.some((post) => post.id === fromUrl);
        if (exists) {
          await handleSelectPost(fromUrl);
        } else {
          setSelectedPostInUrl(null);
        }
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  useEffect(() => {
    autoResizeExcerpt(excerptInputRef.current);
  }, [form.excerpt]);

  const heading = useMemo(
    () => (selectedPostId ? "Edit Blog Post" : "Create Blog Post"),
    [selectedPostId],
  );
  const primaryActionLabel = useMemo(
    () => (selectedPostId ? "Update" : "Publish"),
    [selectedPostId],
  );
  const hasContentChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );
  const isPublishReady = useMemo(() => {
    const hasTitle = form.title.trim().length > 0;
    const hasTopic = form.topic.trim().length > 0;
    const hasExcerpt = form.excerpt.trim().length > 0;
    const hasContent = form.content.trim().length > 0;
    const hasTags = form.tags.some((tag) => tag.trim().length > 0);
    return hasTitle && hasTopic && hasExcerpt && hasContent && hasTags;
  }, [form.content, form.excerpt, form.tags, form.title, form.topic]);
  const canSavePublished = useMemo(
    () => isPublishReady && (hasContentChanges || form.status !== "PUBLISHED"),
    [hasContentChanges, form.status, isPublishReady],
  );
  const canSaveDraft = useMemo(
    () => hasContentChanges || form.status !== "DRAFT",
    [hasContentChanges, form.status],
  );

  const setTagsFromInput = (raw: string) => {
    setTagsInput(raw);
    const parsed = raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
    setForm((prev) => ({ ...prev, tags: parsed }));
  };

  const handleSelectPost = async (id: number) => {
    const details = await getAdminBlogById(id);
    const hydratedForm: BlogPostUpsertRequest = {
      title: details.title,
      topic: details.topic,
      excerpt: details.excerpt,
      content: details.content,
      coverImage: details.coverImage || "",
      tags: details.tags ?? [],
      status: details.status,
    };
    setSelectedPostId(details.id);
    setForm(hydratedForm);
    setSavedForm(hydratedForm);
    setTagsInput((details.tags ?? []).join(", "));
    setSelectedPostInUrl(details.id);
    setTimeout(() => autoResizeExcerpt(excerptInputRef.current), 0);
  };

  const handleCreateNew = () => {
    const emptyForm = createEmptyPost();
    setSelectedPostId(null);
    setForm(emptyForm);
    setSavedForm(emptyForm);
    setTagsInput("");
    setIsPreview(false);
    setSelectedPostInUrl(null);
    setTimeout(() => autoResizeExcerpt(excerptInputRef.current), 0);
  };

  const saveWithStatus = async (status: BlogPostStatus) => {
    if (status === "PUBLISHED" && !isPublishReady) {
      return;
    }

    setSaving(true);
    const payload = { ...form, status };
    try {
      const saved = selectedPostId
        ? await updateAdminBlog(selectedPostId, payload)
        : await createAdminBlog(payload);
      const nextForm: BlogPostUpsertRequest = {
        title: saved.title,
        topic: saved.topic,
        excerpt: saved.excerpt,
        content: saved.content,
        coverImage: saved.coverImage || "",
        tags: saved.tags || [],
        status: saved.status,
      };
      setSelectedPostId(saved.id);
      setForm(nextForm);
      setSavedForm(nextForm);
      setTagsInput((saved.tags || []).join(", "));
      setTimeout(() => autoResizeExcerpt(excerptInputRef.current), 0);
      await loadPosts();
    } finally {
      setSaving(false);
    }
  };

  const removeCurrentPost = async () => {
    if (!selectedPostId) return;
    const shouldDelete = await confirmAction({
      title: "Delete Blog Post",
      message: "Are you sure you want to permanently delete this blog post?",
      confirmText: "Delete",
    });
    if (!shouldDelete) return;

    await deleteAdminBlog(selectedPostId);
    await loadPosts();
    handleCreateNew();
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4">
      <aside className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-2)] p-3 h-fit">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold theme-text-1">Blog Posts</h3>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white text-sm"
          >
            <Plus size={14} />
            New
          </button>
        </div>
        <div className="space-y-2 max-h-[72vh] overflow-y-auto pr-1">
          {loading && <p className="text-sm theme-text-3">Loading posts...</p>}
          {!loading && posts.length === 0 && (
            <p className="text-sm theme-text-3">No posts yet. Create your first draft.</p>
          )}
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => void handleSelectPost(post.id)}
              className={`w-full text-left rounded-xl border px-3 py-2 transition ${
                selectedPostId === post.id
                  ? "border-[var(--accent-1)] bg-[var(--surface-1)]"
                  : "border-[var(--border-1)] bg-[var(--surface-1)] hover:bg-[var(--surface-3)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold theme-text-1 truncate">{post.title}</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusClass(post.status)}`}>
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-xs theme-text-2 mt-1 truncate">{post.topic || "No topic"}</p>
              <p className="text-[11px] theme-text-3 mt-1">Updated: {formatDate(post.updatedAt)}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-2)] p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold theme-text-1">{heading}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreview((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 border border-[var(--border-1)] bg-[var(--surface-1)] hover:bg-[var(--surface-3)] theme-text-1 text-sm"
            >
              {isPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {isPreview ? "Edit" : "Preview"}
            </button>
            {selectedPostId && (
              <button
                type="button"
                onClick={() => void removeCurrentPost()}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 text-sm"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        </div>

        {!isPreview ? (
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs theme-text-2 mb-1">Post Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="New post title..."
                  className="w-full rounded-lg bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs theme-text-2 mb-1">Topic</label>
                <input
                  value={form.topic}
                  onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                  placeholder="Java / System Design / Frontend..."
                  className="w-full rounded-lg bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs theme-text-2 mb-1">Tags (max 4, comma separated)</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsFromInput(e.target.value)}
                  placeholder="java, spring-boot, architecture"
                  className="w-full rounded-lg bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs theme-text-2 mb-1">Upload Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const uploaded = await uploadAdminFile(file, "images");
                    setForm((prev) => ({ ...prev, coverImage: uploaded.url }));
                    e.currentTarget.value = "";
                  }}
                  className="w-full rounded-lg bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs theme-text-2 mb-1">Excerpt</label>
              <textarea
                rows={3}
                ref={excerptInputRef}
                value={form.excerpt}
                onChange={(e) => {
                  autoResizeExcerpt(e.currentTarget);
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }));
                }}
                placeholder="Short preview text for cards..."
                className="w-full rounded-lg bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm resize-none overflow-hidden"
              />
            </div>

            <div>
              <label className="block text-xs theme-text-2 mb-1">Content</label>
              <ToastMarkdownEditor
                value={form.content}
                onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                minHeight={440}
                placeholder="Write your post content here..."
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border-1)] bg-[var(--surface-1)] p-4 space-y-3">
            <h2 className="text-2xl font-bold theme-text-1">{form.title || "Untitled Post"}</h2>
            <div className="flex flex-wrap gap-2">
              {form.tags.length ? (
                form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-1 text-xs border border-[var(--border-1)] bg-[var(--surface-2)] theme-text-2"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-xs theme-text-3">No tags</span>
              )}
            </div>
            {form.coverImage && (
              <img
                src={form.coverImage}
                alt="Cover"
                className="w-full max-h-72 object-cover rounded-lg border border-[var(--border-1)]"
              />
            )}
            <p className="theme-text-2">{form.excerpt}</p>
            <ToastMarkdownViewer value={form.content || "Write your post content here..."} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={saving || !canSavePublished}
            onClick={() => void saveWithStatus("PUBLISHED")}
            className={`rounded-xl px-4 py-2 text-white transition disabled:cursor-not-allowed ${
              canSavePublished
                ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.45)]"
                : "bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] opacity-60"
            }`}
          >
            {saving ? "Saving..." : primaryActionLabel}
          </button>
          <button
            type="button"
            disabled={saving || !canSaveDraft}
            onClick={() => void saveWithStatus("DRAFT")}
            className="rounded-xl px-4 py-2 border border-[var(--border-1)] bg-[var(--surface-1)] hover:bg-[var(--surface-3)] theme-text-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save Draft
          </button>
        </div>
      </section>
    </div>
  );
};

export default BlogSection;
