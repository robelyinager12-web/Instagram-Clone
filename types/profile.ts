export type ProfilePost = {
  id: string;
  thumbnailUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  isCarousel: boolean;
  likeCount: number;
  commentCount: number;
};

export type ProfileData = {
  id: string;
  username: string;
  fullName: string | null;
  bio: string | null;
  website: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  isPrivate: boolean;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isOwnProfile: boolean;
  followStatus: "NONE" | "PENDING" | "ACCEPTED";
  isBlockedByViewer: boolean;
  canViewPosts: boolean;
};

export type ProfilePostsPage = {
  posts: ProfilePost[];
  nextCursor: string | null;
};
