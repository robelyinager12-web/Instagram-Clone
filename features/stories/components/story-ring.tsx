import Image from "next/image";
import { cn } from "@/lib/utils";

export function StoryRing({
  avatarUrl,
  username,
  hasUnseen,
  size = 56,
}: {
  avatarUrl: string | null;
  username: string;
  hasUnseen: boolean;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full p-[2px]",
        hasUnseen
          ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
          : "bg-border"
      )}
      style={{ width: size, height: size }}
    >
      <div className="rounded-full bg-background p-[2px]">
        <div
          className="overflow-hidden rounded-full bg-muted"
          style={{ width: size - 8, height: size - 8 }}
        >
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt={username}
              width={size - 8}
              height={size - 8}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}
