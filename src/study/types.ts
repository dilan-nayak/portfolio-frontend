export type StudyPostStatus = "DRAFT" | "PUBLISHED";

export type StudyTopic = "Java" | "System Design" | "Frontend" | "Database";

export interface StudyComment {
  id: number;
  parentCommentId: number | null;
  authorName: string;
  content: string;
  likeCount: number;
  createdAt: string;
  replies: StudyComment[];
}

export interface StudyPostSummary {
  id: number;
  title: string;
  slug: string;
  topic: StudyTopic | string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  status: StudyPostStatus;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  publishedAt: string | null;
  updatedAt: string;
}

export interface StudyPostDetail extends StudyPostSummary {
  content: string;
  createdAt: string;
  comments: StudyComment[];
}

export interface StudyPostUpsertRequest {
  title: string;
  topic: StudyTopic;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: StudyPostStatus;
}

export interface StudyCommentCreateRequest {
  authorName: string;
  content: string;
  parentCommentId?: number;
}
