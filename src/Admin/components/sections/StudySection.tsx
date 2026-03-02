import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ConfirmAction } from "./types";
import { uploadAdminFile } from "../../adminService";
import ToastMarkdownEditor from "../editor/ToastMarkdownEditor";
import ToastMarkdownViewer from "../editor/ToastMarkdownViewer";
import {
  createAdminStudyPost,
  deleteAdminStudyPost,
  getAdminStudyPostById,
  getAdminStudyPosts,
  updateAdminStudyPost,
} from "../../../study/studyService";
import type {
  StudyPostStatus,
  StudyPostSummary,
  StudyPostUpsertRequest,
  StudyTopic,
} from "../../../study/types";

const STUDY_TOPICS: StudyTopic[] = ["Java", "System Design", "Frontend", "Database"];

const topicBadgeMap: Record<StudyTopic, string> = {
  Java: "bg-amber-100 text-amber-800 border border-amber-300",
  "System Design": "bg-indigo-100 text-indigo-800 border border-indigo-300",
  Frontend: "bg-cyan-100 text-cyan-800 border border-cyan-300",
  Database: "bg-emerald-100 text-emerald-800 border border-emerald-300",
};

const getTopicBadgeClass = (topic: string): string => {
  if (topic in topicBadgeMap) {
    return topicBadgeMap[topic as StudyTopic];
  }
  return "bg-slate-100 text-slate-700 border border-slate-300";
};

const createEmptyStudy = (): StudyPostUpsertRequest => ({
  title: "",
  topic: "Java",
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

interface StudySectionProps {
  confirmAction: ConfirmAction;
}

const StudySection: React.FC<StudySectionProps> = ({ confirmAction }) => {
  const STUDY_POST_QUERY_KEY = "studyPostId";
  const [posts, setPosts] = useState<StudyPostSummary[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | "All">("All");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [form, setForm] = useState<StudyPostUpsertRequest>(createEmptyStudy());
  const [savedForm, setSavedForm] = useState<StudyPostUpsertRequest>(createEmptyStudy());
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
    const response = await getAdminStudyPosts();
    setPosts(response);
    return response;
  };

  const setSelectedPostInUrl = (id: number | null) => {
    const params = new URLSearchParams(window.location.search);
    if (id === null) {
      params.delete(STUDY_POST_QUERY_KEY);
    } else {
      params.set(STUDY_POST_QUERY_KEY, String(id));
    }
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const response = await loadPosts();
        const fromUrl = Number(new URLSearchParams(window.location.search).get(STUDY_POST_QUERY_KEY));
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

  const visiblePosts = useMemo(() => {
    if (selectedTopic === "All") {
      return posts;
    }
    return posts.filter((post) => post.topic === selectedTopic);
  }, [posts, selectedTopic]);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length };
    STUDY_TOPICS.forEach((topic) => {
      counts[topic] = posts.filter((post) => post.topic === topic).length;
    });
    return counts;
  }, [posts]);

  const heading = selectedPostId ? "Edit Study Note" : "Create Study Note";
  const primaryActionLabel = selectedPostId ? "Update" : "Publish";
  const hasContentChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );
  const isPublishReady = useMemo(() => {
    const hasTitle = form.title.trim().length > 0;
    const hasExcerpt = form.excerpt.trim().length > 0;
    const hasContent = form.content.trim().length > 0;
    const hasTags = form.tags.some((tag) => tag.trim().length > 0);
    return hasTitle && hasExcerpt && hasContent && hasTags;
  }, [form.content, form.excerpt, form.tags, form.title]);
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
    const detail = await getAdminStudyPostById(id);
    const hydratedForm: StudyPostUpsertRequest = {
      title: detail.title,
      topic: (detail.topic as StudyTopic) ?? "Java",
      excerpt: detail.excerpt,
      content: detail.content,
      coverImage: detail.coverImage || "",
      tags: detail.tags || [],
      status: detail.status,
    };
    setSelectedPostId(detail.id);
    setForm(hydratedForm);
    setSavedForm(hydratedForm);
    setTagsInput((detail.tags || []).join(", "));
    setSelectedPostInUrl(detail.id);
    setTimeout(() => autoResizeExcerpt(excerptInputRef.current), 0);
  };

  const handleCreateNew = () => {
    const emptyForm = createEmptyStudy();
    setSelectedPostId(null);
    setForm(emptyForm);
    setSavedForm(emptyForm);
    setTagsInput("");
    setIsPreview(false);
    setSelectedPostInUrl(null);
    setTimeout(() => autoResizeExcerpt(excerptInputRef.current), 0);
  };

  const saveWithStatus = async (status: StudyPostStatus) => {
    if (status === "PUBLISHED" && !isPublishReady) {
      return;
    }

    setSaving(true);
    const payload: StudyPostUpsertRequest = { ...form, status };
    try {
      const saved = selectedPostId
        ? await updateAdminStudyPost(selectedPostId, payload)
        : await createAdminStudyPost(payload);
      const nextForm: StudyPostUpsertRequest = {
        title: saved.title,
        topic: (saved.topic as StudyTopic) ?? "Java",
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
      title: "Delete Study Note",
      message: "This study note will be permanently deleted. Continue?",
      confirmText: "Delete",
    });
    if (!shouldDelete) return;

    await deleteAdminStudyPost(selectedPostId);
    await loadPosts();
    handleCreateNew();
  };

  return (
    <div className="grid xl:grid-cols-[360px_1fr] gap-5">
      <aside className="rounded-3xl border border-[var(--border-1)] bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)] p-4 shadow-[0_14px_40px_var(--accent-soft)]">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider theme-text-3">Study Studio</p>
            <h3 className="text-lg font-semibold theme-text-1 inline-flex items-center gap-2">
              <BookOpenCheck size={18} className="text-[var(--accent-1)]" />
              Notes Library
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white text-sm"
          >
            <Plus size={14} />
            New
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {["All", ...STUDY_TOPICS].map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setSelectedTopic(topic as StudyTopic | "All")}
              className={`rounded-lg px-2.5 py-2 text-xs font-medium border transition ${
                selectedTopic === topic
                  ? "bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white border-transparent"
                  : "bg-[var(--surface-1)] border-[var(--border-1)] theme-text-2 hover:theme-text-1"
              }`}
            >
              {topic} ({topicCounts[topic] ?? 0})
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[66vh] overflow-y-auto pr-1">
          {loading && <p className="text-sm theme-text-3">Loading notes...</p>}
          {!loading && visiblePosts.length === 0 && (
            <p className="text-sm theme-text-3">No study note found for this topic.</p>
          )}
          {visiblePosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => void handleSelectPost(post.id)}
              className={`w-full text-left rounded-xl border px-3 py-3 transition ${
                selectedPostId === post.id
                  ? "border-[var(--accent-1)] bg-[var(--surface-1)]"
                  : "border-[var(--border-1)] bg-[var(--surface-1)] hover:bg-[var(--surface-3)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold theme-text-1 line-clamp-2">{post.title || "Untitled"}</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${post.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-amber-100 text-amber-700 border border-amber-300"}`}>
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${getTopicBadgeClass(post.topic)}`}
                >
                  {post.topic}
                </span>
                <span className="text-[11px] theme-text-3">{formatDate(post.updatedAt)}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-[var(--border-1)] bg-[var(--surface-2)] shadow-[0_14px_40px_var(--accent-soft)] overflow-hidden">
        <div className="border-b border-[var(--border-1)] bg-[var(--surface-1)] px-5 py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <GraduationCap size={18} className="text-[var(--accent-1)]" />
            <h3 className="text-lg font-semibold theme-text-1">{heading}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreview((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 border border-[var(--border-1)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] theme-text-1 text-sm"
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
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-3">
              <div>
                <label className="block text-xs theme-text-2 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Write a study note title..."
                  className="w-full rounded-xl bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs theme-text-2 mb-1">Topic</label>
                <select
                  value={form.topic}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, topic: e.target.value as StudyTopic }))
                  }
                  className="w-full rounded-xl bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
                >
                  {STUDY_TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs theme-text-2 mb-1">Tags (max 4)</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsFromInput(e.target.value)}
                  placeholder="java, spring, microservices"
                  className="w-full rounded-xl bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm"
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
                  className="w-full rounded-xl bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs theme-text-2 mb-1">Short Excerpt</label>
              <textarea
                rows={3}
                value={form.excerpt}
                ref={excerptInputRef}
                onChange={(e) => {
                  autoResizeExcerpt(e.currentTarget);
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }));
                }}
                placeholder="A concise summary for Study cards..."
                className="w-full rounded-xl bg-[var(--surface-1)] theme-text-1 border border-[var(--border-1)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent-1)] text-sm resize-none overflow-hidden"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs theme-text-2">Markdown Content</label>
                <span className="inline-flex items-center gap-1 text-xs theme-text-3">
                  <Sparkles size={12} />
                  Tip: use headings and bullet points for readability.
                </span>
              </div>
              <ToastMarkdownEditor
                value={form.content}
                onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                minHeight={480}
                placeholder="Write your study content here..."
              />
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4 bg-[var(--surface-1)]">
            <h2 className="text-3xl font-bold theme-text-1">{form.title || "Untitled Study Note"}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs ${topicBadgeMap[form.topic]}`}>
                {form.topic}
              </span>
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-1 text-xs border border-[var(--border-1)] bg-[var(--surface-2)] theme-text-2"
                >
                  #{tag}
                </span>
              ))}
            </div>
            {form.coverImage && (
              <img
                src={form.coverImage}
                alt="Study cover"
                className="w-full max-h-80 object-cover rounded-xl border border-[var(--border-1)]"
              />
            )}
            <p className="theme-text-2">{form.excerpt}</p>
            <ToastMarkdownViewer value={form.content || "Start writing your study note in edit mode..."} />
          </div>
        )}

        <div className="border-t border-[var(--border-1)] bg-[var(--surface-1)] px-5 py-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={saving || !canSavePublished}
            onClick={() => void saveWithStatus("PUBLISHED")}
            className={`rounded-xl px-4 py-2 text-white disabled:cursor-not-allowed inline-flex items-center gap-2 transition ${
              canSavePublished
                ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.45)]"
                : "bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] opacity-60"
            }`}
          >
            <Save size={14} />
            {saving ? "Saving..." : primaryActionLabel}
          </button>
          <button
            type="button"
            disabled={saving || !canSaveDraft}
            onClick={() => void saveWithStatus("DRAFT")}
            className="rounded-xl px-4 py-2 border border-[var(--border-1)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] theme-text-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save Draft
          </button>
        </div>
      </section>
    </div>
  );
};

export default StudySection;
