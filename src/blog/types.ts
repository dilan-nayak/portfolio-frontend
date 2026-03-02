export type BlogPostStatus = "DRAFT" | "PUBLISHED";

export interface BlogComment {
  id: number;
  parentCommentId: number | null;
  authorName: string;
  content: string;
  likeCount: number;
  createdAt: string;
  replies: BlogComment[];
}

export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
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
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  createdAt: string;
  comments: BlogComment[];
}

export interface BlogPostUpsertRequest {
  title: string;
  topic: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: BlogPostStatus;
}

export interface BlogCommentCreateRequest {
  authorName: string;
  content: string;
  parentCommentId?: number;
}

