import { Skeleton } from "@/components/ui/skeleton";

/** Lightweight placeholder while auth hydrates — avoids pulling full dashboard skeleton. */
export function AuthLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col gap-4 p-4 md:p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[120px] w-full rounded-2xl" />
      <Skeleton className="h-[120px] w-full rounded-2xl" />
    </div>
  );
}
