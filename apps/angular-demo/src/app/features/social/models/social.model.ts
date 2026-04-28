export interface SocialPostProperties {
  id: string;
  body: string;
  authorId: string;
  imageUrl: string;
  isAuthor: boolean;
  authorName: string;
  authorHandle: string;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SocialCommentProperties {
  id: string;
  postId: string;
  body: string;
  authorId: string;
  isAuthor: boolean;
  authorName: string;
  authorHandle: string;
  createdAt: string;
  updatedAt?: string;
  hidden: boolean;
}
