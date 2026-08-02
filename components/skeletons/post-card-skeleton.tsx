export function PostCardSkeleton() {
  return (
    <div className="animate-pulse border-b border-border pb-4 sm:mb-6 sm:rounded-lg sm:border sm:pb-0">
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
      <div className="aspect-square w-full bg-muted" />
      <div className="space-y-2 px-3 py-3">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}
