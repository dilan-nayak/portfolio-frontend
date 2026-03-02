import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MessageCircle, ThumbsUp } from "lucide-react";
import { getPublishedBlogs } from "../blog/blogService";
import type { BlogPostSummary } from "../blog/types";
import { resolveApiUrl } from "../Admin/adminService";
import ThemeToggleButton from "../Components/ThemeToggleButton";

const formatDate = (value: string | null) => {
  if (!value) return "Draft";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getPublishedBlogs();
        setPosts(response);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Unable to load blog posts";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, []);

  return (
    <section className="min-h-screen theme-section px-4 sm:px-6 py-10 sm:py-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 sm:mb-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold theme-text-1">
                My{" "}
                <span className="bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
                  Blogs
                </span>
              </h1>
              <p className="mt-3 theme-text-2 max-w-3xl">
                I share what I build and learn: new engineering ideas, project progress, system
                design thoughts, and practical implementation notes.
              </p>
            </div>
            <ThemeToggleButton className="shrink-0" />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-8 text-center theme-text-2">
            Loading blog posts...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-8 text-center text-red-700">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-8 text-center theme-text-2">
            No published blog posts yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] overflow-hidden h-[430px] flex flex-col transition-colors duration-200 shadow-[0_10px_24px_rgba(0,0,0,0.18)] hover:border-[var(--accent-1)]/55 hover:shadow-[0_0_0_1px_var(--accent-soft),0_14px_28px_rgba(0,0,0,0.22)]"
              >
                <div className="h-[35%] border-b border-[var(--border-1)] bg-[var(--surface-2)]">
                  {post.coverImage ? (
                    <img
                      src={resolveApiUrl(post.coverImage)}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--surface-2)]" />
                  )}
                </div>

                <div className="h-[65%] p-4 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="rounded-full px-2.5 py-1 text-xs border border-[var(--border-1)] bg-[var(--surface-2)] theme-text-2">
                      {post.topic}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs theme-text-3">
                      <Calendar size={12} />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold theme-text-1 mb-2 line-clamp-2">{post.title}</h2>
                  <p className="theme-text-2 text-sm leading-6 mb-3 line-clamp-4">{post.excerpt}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-1 text-xs border border-[var(--border-1)] bg-[var(--surface-2)] theme-text-2"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs theme-text-3">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp size={13} />
                        {post.likeCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle size={13} />
                        {post.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPage;
