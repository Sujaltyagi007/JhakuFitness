import { type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, sub, icon: Icon, iconClassName, valueClassName, className }: {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 sm:p-4 sm:pb-2">
        <CardTitle className="text-sm font-medium text-steel">{label}</CardTitle>
        <Icon size={18} className={iconClassName ?? "text-gold-deep"} />
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-4 sm:pt-0">
        <div className={cn("font-display text-2xl font-bold", valueClassName)}>{value}</div>
        <p className="mt-1 text-xs text-steel">{sub}</p>
      </CardContent>
    </Card>
  );
}
