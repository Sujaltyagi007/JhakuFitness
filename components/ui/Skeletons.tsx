import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return <Skeleton className="h-28 w-full rounded-xl" />;
}

export function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

export function TableRowSkeleton() {
  return <Skeleton className="h-12 w-full rounded-lg" />;
}

export function ContentHeaderSkeleton() {
  return (
    <>
      <Skeleton className="h-6 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </>
  );
}

export function TabButtonSkeleton({ widthClass = "w-24" }: { widthClass?: string }) {
  return <Skeleton className={`h-10 ${widthClass}`} />;
}

export function FormFieldSkeleton() {
  return (
    <div>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
