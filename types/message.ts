export type ChatParticipant = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type ChatSummary = {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string | null;
  otherParticipant: ChatParticipant | null;
  lastMessage: {
    content: string | null;
    type: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
};

export type MessageItem = {
  id: string;
  chatId: string;
  senderId: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "VOICE" | "POST_SHARE" | "REEL_SHARE";
  content: string | null;
  mediaUrl: string | null;
  createdAt: string;
  isReadByOther: boolean;
};

export type MessagesPage = {
  messages: MessageItem[];
  nextCursor: string | null;
};
