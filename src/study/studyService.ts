import { getAuthToken, resolveApiUrl } from "../Admin/adminService";
import { getCachedOrFetch, invalidateCachePrefix } from "../lib/clientCache";
import type {
  StudyComment,
  StudyCommentCreateRequest,
  StudyPostDetail,
  StudyPostSummary,
  StudyPostUpsertRequest,
} from "./types";

type CountResponse = { count: number };
type ApiErrorPayload = { message?: string };
const STUDY_LIST_CACHE_KEY = "study:list";
const STUDY_DETAIL_CACHE_KEY_PREFIX = "study:detail:";

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

export const getAdminStudyPosts = async (): Promise<StudyPostSummary[]> => {
  const response = await authorizedRequest("/api/admin/study");
  return (await response.json()) as StudyPostSummary[];
};

export const getAdminStudyPostById = async (id: number): Promise<StudyPostDetail> => {
  const response = await authorizedRequest(`/api/admin/study/${id}`);
  return (await response.json()) as StudyPostDetail;
};

export const createAdminStudyPost = async (
  request: StudyPostUpsertRequest,
): Promise<StudyPostDetail> => {
  const response = await authorizedRequest("/api/admin/study", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const created = (await response.json()) as StudyPostDetail;
  invalidateCachePrefix("study:");
  return created;
};

export const updateAdminStudyPost = async (
  id: number,
  request: StudyPostUpsertRequest,
): Promise<StudyPostDetail> => {
  const response = await authorizedRequest(`/api/admin/study/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const updated = (await response.json()) as StudyPostDetail;
  invalidateCachePrefix("study:");
  return updated;
};

export const deleteAdminStudyPost = async (id: number): Promise<void> => {
  await authorizedRequest(`/api/admin/study/${id}`, {
    method: "DELETE",
  });
  invalidateCachePrefix("study:");
};

export const getPublishedStudyPosts = async (): Promise<StudyPostSummary[]> => {
  return getCachedOrFetch(STUDY_LIST_CACHE_KEY, async () => {
    const response = await fetch(resolveApiUrl("/api/study"));
    if (!response.ok) {
      throw new Error(await toErrorMessage(response));
    }
    return (await response.json()) as StudyPostSummary[];
  });
};

export const getPublishedStudyPostById = async (id: number): Promise<StudyPostDetail> => {
  return getCachedOrFetch(`${STUDY_DETAIL_CACHE_KEY_PREFIX}${id}`, async () => {
    const response = await fetch(resolveApiUrl(`/api/study/${id}`));
    if (!response.ok) {
      throw new Error(await toErrorMessage(response));
    }
    return (await response.json()) as StudyPostDetail;
  });
};

export const likeStudyPost = async (id: number): Promise<number> => {
  const response = await fetch(resolveApiUrl(`/api/study/${id}/like`), { method: "POST" });
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  invalidateCachePrefix("study:");
  return ((await response.json()) as CountResponse).count;
};

export const shareStudyPost = async (id: number): Promise<number> => {
  const response = await fetch(resolveApiUrl(`/api/study/${id}/share`), { method: "POST" });
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  invalidateCachePrefix("study:");
  return ((await response.json()) as CountResponse).count;
};

export const addStudyComment = async (
  id: number,
  payload: StudyCommentCreateRequest,
): Promise<StudyComment[]> => {
  const response = await fetch(resolveApiUrl(`/api/study/${id}/comments`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  invalidateCachePrefix("study:");
  return (await response.json()) as StudyComment[];
};

export const likeStudyComment = async (commentId: number): Promise<number> => {
  const response = await fetch(resolveApiUrl(`/api/study/comments/${commentId}/like`), {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  invalidateCachePrefix("study:");
  return ((await response.json()) as CountResponse).count;
};
