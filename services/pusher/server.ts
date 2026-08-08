import PusherServer from "pusher";
import { userChannel, chatChannel, PUSHER_EVENTS } from "./shared";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  useTLS: true,
});

export { userChannel, chatChannel, PUSHER_EVENTS };

export async function triggerEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
) {
  try {
    await pusherServer.trigger(channel, event, data);
  } catch (err) {
    console.error(`Pusher trigger failed (${channel}/${event})`, err);
  }
}
