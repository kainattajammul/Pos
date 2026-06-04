import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartCardSkeleton({ titleWidth = "w-36" }: { titleWidth?: string }) {
  return (
    <Card className="border-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <Skeleton className={`h-6 ${titleWidth}`} />
        <Skeleton className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function DonutCardSkeleton() {
  return (
    <Card className="border-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
      </CardContent>
    </Card>
  );
}
