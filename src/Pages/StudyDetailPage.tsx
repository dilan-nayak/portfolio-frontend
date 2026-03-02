import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import {
  ArrowLeft,
  Calendar,
  CornerDownRight,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
} from "lucide-react";
import ThemeToggleButton from "../Components/ThemeToggleButton";
import {
  addStudyComment,
  getPublishedStudyPostById,
  likeStudyComment,
  likeStudyPost,
} from "../study/studyService";
import type { StudyComment, StudyPostDetail } from "../study/types";
import { resolveApiUrl } from "../Admin/adminService";
import {
  hasLikedComment,
  hasLikedPost,
  markCommentLiked,
  markPostLiked,
} from "../utils/engagementGuard";

type ReplyDraft = {
  open: boolean;
  authorName: string;
  content: string;
};

type FlashTone = "success" | "error";

const formatDate = (value: string | null) => {
  if (!value) return "Not published";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const countComments = (items: StudyComment[]): number =>
  items.reduce((acc, item) => acc + 1 + countComments(item.replies), 0);

const collectCommentIds = (items: StudyComment[]): Set<number> => {
  const ids = new Set<number>();
  const walk = (nodes: StudyComment[]) => {
    nodes.forEach((node) => {
      ids.add(node.id);
      if (node.replies.length > 0) {
        walk(node.replies);
      }
    });
  };
  walk(items);
  return ids;
};

const updateCommentLike = (
  items: StudyComment[],
  targetId: number,
  likeCount: number,
): StudyComment[] => {
  return items.map((item) => {
    if (item.id === targetId) {
      return { ...item, likeCount };
    }
    if (!item.replies.length) {
      return item;
    }
    return {
      ...item,
      replies: updateCommentLike(item.replies, targetId, likeCount),
    };
  });
};

const updateCommentContent = (
  items: StudyComment[],
  targetId: number,
  content: string,
): StudyComment[] => {
  return items.map((item) => {
    if (item.id === targetId) {
      return { ...item, content };
    }
    if (!item.replies.length) {
      return item;
    }
    return {
      ...item,
      replies: updateCommentContent(item.replies, targetId, content),
    };
  });
};

const StudyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<StudyPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [flash, setFlash] = useState<{ message: string; tone: FlashTone } | null>(null);
  const [postLiked, setPostLiked] = useState(false);
  const flashTimerRef = useRef<number | null>(null);

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, ReplyDraft>>({});
  const [editableCommentIds, setEditableCommentIds] = useState<Set<number>>(new Set());
  const [editingDrafts, setEditingDrafts] = useState<Record<number, string>>({});
  const markdownColorMode =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

  useEffect(() => {
    if (!id) {
      setError("Invalid study id.");
      setLoading(false);
      return;
    }

    const postId = Number(id);
    if (Number.isNaN(postId)) {
      setError("Invalid study id.");
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getPublishedStudyPostById(postId);
        setPost(response);
        setPostLiked(hasLikedPost("study", response.id));
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Unable to load this study note";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadPost();
  }, [id]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const showFlash = (message: string, tone: FlashTone) => {
    if (flashTimerRef.current) {
      window.clearTimeout(flashTimerRef.current);
    }
    setFlash({ message, tone });
    flashTimerRef.current = window.setTimeout(() => setFlash(null), 2000);
  };

  const commentCount = useMemo(() => (post ? countComments(post.comments) : 0), [post]);

  const handleLikePost = async () => {
    if (!post) return;
    setActionError("");
    if (postLiked) {
      showFlash("Already liked", "error");
      return;
    }
    try {
      const count = await likeStudyPost(post.id);
      setPost((prev) => (prev ? { ...prev, likeCount: count } : prev));
      markPostLiked("study", post.id);
      setPostLiked(true);
      showFlash("Liked", "success");
    } catch (likeError) {
      const message =
        likeError instanceof Error ? likeError.message : "Unable to like this study note";
      setActionError(message);
      showFlash("Like failed", "error");
    }
  };

  const handleShare = async () => {
    if (!post) return;
    setActionError("");
    try {
      if (navigator.clipboard && window.location?.href) {
        await navigator.clipboard.writeText(window.location.href);
        showFlash("Link copied", "success");
      } else {
        showFlash("Copy not supported", "error");
      }
    } catch (shareError) {
      const message =
        shareError instanceof Error ? shareError.message : "Unable to copy link";
      setActionError(message);
      showFlash("Copy failed", "error");
    }
  };

  const handleLikeComment = async (commentId: number) => {
    setActionError("");
    if (hasLikedComment("study", commentId)) {
      showFlash("Comment already liked", "error");
      return;
    }
    try {
      const count = await likeStudyComment(commentId);
      markCommentLiked("study", commentId);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: updateCommentLike(prev.comments, commentId, count),
            }
          : prev,
      );
    } catch (likeError) {
      const message = likeError instanceof Error ? likeError.message : "Unable to like comment";
      setActionError(message);
      showFlash("Comment like failed", "error");
    }
  };

  const submitComment = async (parentCommentId?: number) => {
    if (!post) return;

    const isReply = Boolean(parentCommentId);
    const draft = parentCommentId ? replyDrafts[parentCommentId] : undefined;
    const authorNameInput = (isReply ? draft?.authorName ?? "" : commentAuthor).trim();
    const authorName = authorNameInput || "Anonymous";
    const content = (isReply ? draft?.content ?? "" : commentContent).trim();

    if (!content) {
      setActionError("Please enter a comment.");
      return;
    }

    setActionError("");
    setCommentSubmitting(true);
    const previousIds = collectCommentIds(post.comments);
    try {
      const comments = await addStudyComment(post.id, {
        authorName,
        content,
        parentCommentId,
      });
      setPost((prev) => (prev ? { ...prev, comments, commentCount: countComments(comments) } : prev));
      const nextIds = collectCommentIds(comments);
      const newIds = Array.from(nextIds).filter((commentId) => !previousIds.has(commentId));
      if (newIds.length > 0) {
        setEditableCommentIds((prev) => {
          const updated = new Set(prev);
          newIds.forEach((commentId) => updated.add(commentId));
          return updated;
        });
        showFlash("You can edit this message while staying on this page", "success");
      }

      if (parentCommentId) {
        setReplyDrafts((prev) => ({
          ...prev,
          [parentCommentId]: { open: false, authorName: "", content: "" },
        }));
      } else {
        setCommentAuthor("");
        setCommentContent("");
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to submit comment";
      setActionError(message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const startEditComment = (commentId: number, content: string) => {
    if (!editableCommentIds.has(commentId)) return;
    setEditingDrafts((prev) => ({ ...prev, [commentId]: content }));
  };

  const cancelEditComment = (commentId: number) => {
    setEditingDrafts((prev) => {
      const updated = { ...prev };
      delete updated[commentId];
      return updated;
    });
  };

  const saveEditComment = (commentId: number) => {
    const draft = editingDrafts[commentId];
    if (!draft) return;
    const content = draft.trim();
    if (!content) {
      setActionError("Comment cannot be empty.");
      return;
    }
    setPost((prev) =>
      prev
        ? {
            ...prev,
            comments: updateCommentContent(prev.comments, commentId, content),
          }
        : prev,
    );
    cancelEditComment(commentId);
    showFlash("Comment edited for this session", "success");
  };

  const toggleReplyDraft = (commentId: number) => {
    setReplyDrafts((prev) => {
      const current = prev[commentId];
      return {
        ...prev,
        [commentId]: {
          open: !current?.open,
          authorName: current?.authorName ?? "",
          content: current?.content ?? "",
        },
      };
    });
  };

  const setReplyField = (commentId: number, field: "authorName" | "content", value: string) => {
    setReplyDrafts((prev) => ({
      ...prev,
      [commentId]: {
        open: prev[commentId]?.open ?? true,
        authorName: field === "authorName" ? value : prev[commentId]?.authorName ?? "",
        content: field === "content" ? value : prev[commentId]?.content ?? "",
      },
    }));
  };

  const renderComment = (comment: StudyComment, depth = 0) => {
    const reply = replyDrafts[comment.id];
    const isEditing = Object.prototype.hasOwnProperty.call(editingDrafts, comment.id);
    const isEditable = editableCommentIds.has(comment.id);

    return (
      <div
        key={comment.id}
        className={`rounded-xl border border-[var(--border-1)] bg-[var(--surface-2)] p-4 ${
          depth > 0 ? "ml-4 sm:ml-8 mt-3" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold theme-text-1">{comment.authorName || "Anonymous"}</p>
          <p className="text-xs theme-text-3">{formatDate(comment.createdAt)}</p>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              rows={3}
              value={editingDrafts[comment.id] ?? ""}
              onChange={(e) =>
                setEditingDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-1)] resize-y"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => saveEditComment(comment.id)}
                className="rounded-lg px-3 py-2 text-sm bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => cancelEditComment(comment.id)}
                className="rounded-lg px-3 py-2 text-sm border border-[var(--border-1)] bg-[var(--surface-1)] theme-text-2 hover:theme-text-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap theme-text-2 leading-7">{comment.content}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleLikeComment(comment.id)}
            disabled={hasLikedComment("study", comment.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-2.5 py-1 text-xs theme-text-2 hover:theme-text-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ThumbsUp size={13} />
            {comment.likeCount}
          </button>
          <button
            type="button"
            onClick={() => toggleReplyDraft(comment.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-2.5 py-1 text-xs theme-text-2 hover:theme-text-1"
          >
            <CornerDownRight size={13} />
            Reply
          </button>
          {isEditable && !isEditing ? (
            <button
              type="button"
              onClick={() => startEditComment(comment.id, comment.content)}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-2.5 py-1 text-xs theme-text-2 hover:theme-text-1"
            >
              Edit
            </button>
          ) : null}
        </div>

        {reply?.open ? (
          <div className="mt-3 grid gap-2">
            <input
              type="text"
              value={reply.authorName}
              onChange={(e) => setReplyField(comment.id, "authorName", e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-1)]"
            />
            <textarea
              rows={3}
              value={reply.content}
              onChange={(e) => setReplyField(comment.id, "content", e.target.value)}
              placeholder="Write a reply..."
              className="w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-1)] resize-y"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={commentSubmitting}
                onClick={() => void submitComment(comment.id)}
                className="rounded-lg px-3 py-2 text-sm bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white disabled:opacity-70"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => toggleReplyDraft(comment.id)}
                className="rounded-lg px-3 py-2 text-sm border border-[var(--border-1)] bg-[var(--surface-1)] theme-text-2 hover:theme-text-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {comment.replies.length > 0 ? (
          <div className="mt-3 space-y-3">{comment.replies.map((item) => renderComment(item, depth + 1))}</div>
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[var(--app-bg)] theme-text-1 px-4 sm:px-6 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-8 text-center theme-text-2">
          Loading study note...
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="min-h-screen bg-[var(--app-bg)] theme-text-1 px-4 sm:px-6 py-10 sm:py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <Link
            to="/study"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-3 py-2 text-sm theme-text-2 hover:theme-text-1"
          >
            <ArrowLeft size={16} />
            Back to Study
          </Link>
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-700">{error || "Study not found"}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--app-bg)] theme-text-1 px-4 sm:px-6 py-10 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/study"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-1)] bg-[var(--surface-1)] px-3 py-2 text-sm theme-text-2 hover:theme-text-1"
          >
            <ArrowLeft size={16} />
            Back to Study
          </Link>
          <ThemeToggleButton />
        </div>

        <article className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] overflow-hidden">
          {post.coverImage ? (
            <img
              src={resolveApiUrl(post.coverImage)}
              alt={post.title}
              className="w-full max-h-[380px] object-cover border-b border-[var(--border-1)]"
            />
          ) : null}

          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full px-3 py-1 text-xs border border-[var(--border-1)] bg-[var(--surface-2)] theme-text-2">
                {post.topic}
              </span>
              <span className="inline-flex items-center gap-1 text-xs theme-text-3">
                <Calendar size={12} />
                {formatDate(post.publishedAt)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold theme-text-1 leading-tight">{post.title}</h1>
            <div data-color-mode={markdownColorMode}>
              <MarkdownPreview
                source={post.content}
                style={{
                  backgroundColor: "transparent",
                  color: "var(--text-2)",
                  lineHeight: 1.9,
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-1 text-xs border border-[var(--border-1)] bg-[var(--surface-2)] theme-text-2"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-1)]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleLikePost()}
                  disabled={postLiked}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] px-3 py-2 text-sm theme-text-2 hover:theme-text-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ThumbsUp size={15} />
                  {post.likeCount}
                </button>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] px-3 py-2 text-sm theme-text-2 hover:theme-text-1"
                >
                  <Share2 size={15} />
                  Share
                </button>
                <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] px-3 py-2 text-sm theme-text-2">
                  <MessageCircle size={15} />
                  {commentCount}
                </span>
              </div>
            </div>
          </div>
        </article>

        <section className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 sm:p-8 space-y-4">
          <h2 className="text-2xl font-semibold theme-text-1">Discussion</h2>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)]"
            />
          </div>

          <textarea
            rows={4}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent-1)] resize-y"
          />

          <button
            type="button"
            disabled={commentSubmitting}
            onClick={() => void submitComment()}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white disabled:opacity-70"
          >
            <Send size={15} />
            {commentSubmitting ? "Posting..." : "Post Comment"}
          </button>

          {actionError && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          )}
          {post.comments.length === 0 ? (
            <p className="theme-text-3 text-sm">No comments yet. Start the discussion.</p>
          ) : (
            <div className="space-y-3">{post.comments.map((comment) => renderComment(comment))}</div>
          )}
        </section>
      </div>
      {flash ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none">
          <div
            className={`inline-flex max-w-[min(92vw,460px)] items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.38)] ${
              flash.tone === "success"
                ? "border-sky-300/50 bg-sky-500/18 text-sky-100 shadow-[0_0_36px_rgba(56,189,248,0.45)]"
                : "border-rose-300/50 bg-rose-500/18 text-rose-100 shadow-[0_0_36px_rgba(244,63,94,0.45)]"
            }`}
          >
            {flash.message}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default StudyDetailPage;
