export function userChannel(userId: string) {
  return `private-user-${userId}`;
}

export function chatChannel(chatId: string) {
  return `presence-chat-${chatId}`;
}

export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  MESSAGE_READ: "message-read",
  NOTIFICATION: "notification",
  TYPING: "client-typing",
} as const;
