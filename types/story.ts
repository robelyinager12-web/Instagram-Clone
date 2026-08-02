export type StoryItem = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  caption: string | null;
  createdAt: string;
  expiresAt: string;
  isSeenByViewer: boolean;
};

export type StoryGroup = {
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  stories: StoryItem[];
  hasUnseen: boolean;
};
