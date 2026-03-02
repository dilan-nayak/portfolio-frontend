import { getAuthToken, resolveApiUrl } from "../Admin/adminService";
import { getCachedOrFetch, invalidateCachePrefix } from "../lib/clientCache";
import type {
  BlogComment,
  BlogCommentCreateRequest,
  BlogPostDetail,
  BlogPostSummary,
  BlogPostUpsertRequest,
} from "./types";

type CountResponse = { count: number };
type ApiErrorPayload = { message?: string };
const BLOG_LIST_CACHE_KEY = "blogs:list";
const BLOG_DETAIL_CACHE_KEY_PREFIX = "blogs:detail:";

const toErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const authorizedRequest = async (path: string, init?: RequestInit) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Admin session expired. Please login again.");
  }

  const response = await fetch(resolveApiUrl(path), {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }

  return response;
};

export const getAdminBlogs = async (): Promise<BlogPostSummary[]> => {
  const response = await authorizedRequest("/api/admin/blogs");
  return (await response.json()) as BlogPostSummary[];
};

export const getAdminBlogById = async (id: number): Promise<BlogPostDetail> => {
  const response = await authorizedRequest(`/api/admin/blogs/${id}`);
  return (await response.json()) as BlogPostDetail;
};

export const createAdminBlog = async (
  request: BlogPostUpsertRequest,
): Promise<BlogPostDetail> => {
  const response = await authorizedRequest("/api/admin/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const created = (await response.json()) as BlogPostDetail;
  invalidateCachePrefix("blogs:");
  return created;
};

export const updateAdminBlog = async (
  id: number,
  request: BlogPostUpsertRequest,
): Promise<BlogPostDetail> => {
  const response = await authorizedRequest(`/api/admin/blogs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const updated = (await response.json()) as BlogPostDetail;
  invalidateCachePrefix("blogs:");
  return updated;
};

export const deleteAdminBlog = async (id: number): Promise<void> => {
  await authorizedRequest(`/api/admin/blogs/${id}`, {
    method: "DELETE",
  });
  invalidateCachePrefix("blogs:");
};

export const getPublishedBlogs = async (): Promise<BlogPostSummary[]> => {
  return getCachedOrFetch(BLOG_LIST_CACHE_KEY, async () => {
    const response = await fetch(resolveApiUrl("/api/blogs"));
    if (!response.ok) {
      throw new Error(await toErrorMessage(response));
    }
    return (await response.json()) as BlogPostSummary[];
  });
};

export const getPublishedBlogById = async (id: number): Promise<BlogPostDetail> => {
  return getCachedOrFetch(`${BLOG_DETAIL_CACHE_KEY_PREFIX}${id}`, async () => {
    const response = await fetch(resolveApiUrl(`/api/blogs/${id}`));
    if (!response.ok) {
      throw new Error(await toErrorMessage(response));
    }
    return (await response.json()) as BlogPostDetail;
  });
};

export const likeBlog = async (id: number): Promise<number> => {
  const response = await fetch(resolveApiUrl(`/api/blogs/${id}/like`), { method: "POST" });
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  invalidateCachePrefix("blogs:");
  return ((await response.json()) as CountResponse).count;
};

export const shareBlog = async (id: number): Promise<number> => {
  const response = await fetch(resolveApiUrl(`/api/blogs/${id}/share`), { method: "POST" });
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  invalidateCachePrefix("blogs:");
  return ((await response.json()) as CountResponse).count;
};

export const addBlogComment = async (
  id: number,
  payload: BlogCommentCreateRequest,
): Promise<BlogComment[]> => {
  const response = await fetch(resolveApiUrl(`/api/blogs/${id}/comments`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  invalidateCachePrefix("blogs:");
  return (await response.json()) as BlogComment[];
};

export const likeBlogComment = async (commentId: number): Promise<number> => {
  const response = await fetch(resolveApiUrl(`/api/blogs/comments/${commentId}/like`), {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  invalidateCachePrefix("blogs:");
  return ((await response.json()) as CountResponse).count;
};
