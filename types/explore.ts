export type ExploreTile = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  width: number | null;
  height: number | null;
  likeCount: number;
  commentCount: number;
  isCarousel: boolean;
};

export type ExplorePage = {
  tiles: ExploreTile[];
  nextCursor: string | null;
};
