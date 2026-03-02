const STORAGE_PREFIX = "portfolio-engagement";

const buildLikeKey = (scope: "blog" | "study", id: number) =>
  `${STORAGE_PREFIX}:${scope}:liked:${id}`;

const buildCommentLikeKey = (scope: "blog" | "study", commentId: number) =>
  `${STORAGE_PREFIX}:${scope}:comment-liked:${commentId}`;

export const hasLikedPost = (scope: "blog" | "study", id: number): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(buildLikeKey(scope, id)) === "1";
};

export const markPostLiked = (scope: "blog" | "study", id: number): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(buildLikeKey(scope, id), "1");
};

export const hasLikedComment = (scope: "blog" | "study", commentId: number): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(buildCommentLikeKey(scope, commentId)) === "1";
};

export const markCommentLiked = (scope: "blog" | "study", commentId: number): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(buildCommentLikeKey(scope, commentId), "1");
};
