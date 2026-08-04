import { prisma } from "@/lib/db/prisma";
import type { NotificationsPage } from "@/types/notification";

const PAGE_SIZE = 20;

export async function getNotificationsPage({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string;
}): Promise<NotificationsPage> {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        actor: { select: { id: true, username: true, avatarUrl: true } },
        post: { select: { media: { take: 1, orderBy: { order: "asc" } } } },
      },
    }),
    prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
  ]);

  const hasNextPage = notifications.length > PAGE_SIZE;
  const page = hasNextPage ? notifications.slice(0, PAGE_SIZE) : notifications;

  return {
    notifications: page.map((n) => ({
      id: n.id,
      type: n.type,
      actor: n.actor,
      postId: n.postId,
      postThumbnailUrl: n.post?.media[0]?.url ?? null,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    nextCursor: hasNextPage ? page[page.length - 1].id : null,
    unreadCount,
  };
}
