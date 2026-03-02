import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Coffee,
  Cpu,
  Database,
  Layers,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import { getPublishedStudyPosts } from "../study/studyService";
import type { StudyPostSummary, StudyTopic } from "../study/types";
import { resolveApiUrl } from "../Admin/adminService";
import ThemeToggleButton from "../Components/ThemeToggleButton";

const topicStyles: Record<string, string> = {
  Java: "bg-amber-100 text-amber-700 border border-amber-300",
  "System Design": "bg-indigo-100 text-indigo-700 border border-indigo-300",
  Frontend: "bg-cyan-100 text-cyan-700 border border-cyan-300",
  Database: "bg-emerald-100 text-emerald-700 border border-emerald-300",
};

const topicShowcase = [
  {
    key: "java",
    topic: "Java" as StudyTopic,
    title: "Java",
    shortTitle: "Java",
    description: "Core Java, Spring ecosystem, and backend engineering notes.",
    icon: Coffee,
  },
  {
    key: "system-design",
    topic: "System Design" as StudyTopic,
    title: "System Design",
    shortTitle: "System",
    description: "Scalability, architecture tradeoffs, and distributed systems.",
    icon: Layers,
  },
  {
    key: "frontend",
    topic: "Frontend" as StudyTopic,
    title: "Frontend",
    shortTitle: "Frontend",
    description: "React, UX implementation, and performance-focused UI patterns.",
    icon: Cpu,
  },
  {
    key: "database",
    topic: "Database" as StudyTopic,
    title: "Database",
    shortTitle: "Database",
    description: "SQL modeling, indexing strategy, and query optimization.",
    icon: Database,
  },
];

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

export default function StudyPage() {
  const [posts, setPosts] = useState<StudyPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<StudyTopic[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getPublishedStudyPosts();
        setPosts(response);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Unable to load study notes";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, []);

  const visiblePosts = useMemo(() => {
    if (selectedTopics.length === 0) {
      return posts;
    }
    return posts.filter((post) => selectedTopics.includes(post.topic as StudyTopic));
  }, [selectedTopics, posts]);

  const toggleTopic = (topic: StudyTopic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic],
    );
  };

  return (
    <section className="min-h-screen theme-section px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 sm:mb-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold theme-text-1">
                My Study{" "}
                <span className="bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] bg-clip-text text-transparent">
                  Hub
                </span>
              </h1>
              <p className="mt-3 theme-text-2 max-w-3xl">
                Topic-based notes curated from real project learning. Pick a track and read in depth.
              </p>
            </div>
            <ThemeToggleButton className="shrink-0" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {topicShowcase.map((topic) => {
            const Icon = topic.icon;
            const isActive = selectedTopics.includes(topic.topic);
            return (
              <button
                key={topic.key}
                type="button"
                onClick={() => toggleTopic(topic.topic)}
                className={`text-left rounded-xl border px-3 py-2.5 transition-all duration-300 ${
                  isActive
                    ? "border-[var(--accent-1)] bg-[var(--surface-3)] ring-1 ring-[var(--accent-1)] shadow-[0_0_0_1px_var(--accent-soft),0_0_20px_var(--accent-soft)]"
                    : "border-[var(--border-1)] bg-[var(--surface-2)] hover:-translate-y-0.5 hover:border-[var(--accent-1)] hover:bg-[var(--surface-3)] hover:shadow-[0_0_14px_var(--accent-soft)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] text-white">
                    <Icon size={16} />
                  </div>
                  <h2 className="font-semibold theme-text-1 text-sm md:text-base">
                    <span className="hidden md:inline">{topic.title}</span>
                    <span className="md:hidden">{topic.shortTitle}</span>
                  </h2>
                </div>
                <p className="hidden lg:block mt-2 theme-text-2 text-xs leading-5 line-clamp-2">
                  {topic.description}
                </p>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-8 text-center theme-text-2">
            Loading study notes...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-8 text-center text-red-700">
            {error}
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-8 text-center theme-text-2">
            No published notes for this topic yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visiblePosts.map((post) => (
              <Link
                key={post.id}
                to={`/study/${post.id}`}
                className="group rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] overflow-hidden shadow-[0_12px_40px_var(--accent-soft)] h-[430px] flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-red-400/70 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_18px_45px_rgba(56,189,248,0.28)]"
              >
                <div className="h-[35%] group-hover:h-[25%] border-b border-[var(--border-1)] bg-[var(--surface-2)] transition-all duration-500 ease-in-out">
                  {post.coverImage ? (
                    <img
                      src={resolveApiUrl(post.coverImage)}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--surface-2)]" />
                  )}
                </div>

                <div className="h-[65%] group-hover:h-[75%] p-4 flex flex-col transition-all duration-500 ease-in-out">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        topicStyles[post.topic] ??
                        "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                    >
                      {post.topic}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs theme-text-3">
                      <Calendar size={12} />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold theme-text-1 mb-2 line-clamp-2">{post.title}</h2>
                  <p className="theme-text-2 text-sm leading-6 mb-3 line-clamp-4">{post.excerpt}</p>

                  {/* <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-1 text-xs border border-[var(--border-1)] bg-[var(--surface-2)] theme-text-2"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div> */}

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
}
