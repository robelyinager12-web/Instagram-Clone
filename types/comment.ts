export type CommentAuthor = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type ReplyItem = {
  id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  author: CommentAuthor;
  likeCount: number;
  isLikedByViewer: boolean;
  isOwnComment: boolean;
};

export type CommentItem = ReplyItem & {
  replies: ReplyItem[];
  replyCount: number;
};

export type CommentsPage = {
  comments: CommentItem[];
  nextCursor: string | null;
};
