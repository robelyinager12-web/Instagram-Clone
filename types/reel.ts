export type ReelAuthor = {
  id: string;
  username: string;
  avatarUrl: string | null;
  isVerified: boolean;
};

export type ReelItem = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  audioName: string | null;
  createdAt: string;
  author: ReelAuthor;
  likeCount: number;
  commentCount: number;
  isLikedByViewer: boolean;
  isFollowingAuthor: boolean;
};

export type ReelsPage = {
  reels: ReelItem[];
  nextCursor: string | null;
};
