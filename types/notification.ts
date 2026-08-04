export type NotificationActor = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type NotificationItem = {
  id: string;
  type:
    | "LIKE_POST"
    | "LIKE_COMMENT"
    | "COMMENT"
    | "REPLY"
    | "MENTION"
    | "FOLLOW"
    | "FOLLOW_REQUEST"
    | "FOLLOW_ACCEPTED"
    | "MESSAGE"
    | "TAGGED";
  actor: NotificationActor;
  postId: string | null;
  postThumbnailUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsPage = {
  notifications: NotificationItem[];
  nextCursor: string | null;
  unreadCount: number;
};
