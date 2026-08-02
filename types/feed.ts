export type FeedAuthor = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
};

export type FeedPost = {
  id: string;
  caption: string | null;
  location: string | null;
  createdAt: string;
  author: FeedAuthor;
  media: { id: string; url: string; type: "IMAGE" | "VIDEO"; order: number }[];
  likeCount: number;
  commentCount: number;
  isLikedByViewer: boolean;
  isBookmarkedByViewer: boolean;
};

export type FeedPage = {
  posts: FeedPost[];
  nextCursor: string | null;
};

export type SuggestedUser = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  followerCount: number;
};
