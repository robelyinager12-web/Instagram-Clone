export type UserSearchResult = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  followerCount: number;
};

export type HashtagSearchResult = {
  id: string;
  tag: string;
  postCount: number;
};

export type LocationSearchResult = {
  location: string;
  postCount: number;
};

export type SearchResults = {
  users: UserSearchResult[];
  hashtags: HashtagSearchResult[];
  locations: LocationSearchResult[];
};
