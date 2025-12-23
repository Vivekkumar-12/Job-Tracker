import { cn } from "@/lib/utils";
export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  iconColor,
  delay = 0,
}) {
  return (
    <div
      className="group relative glass rounded-xl p-6 glass-hover card-shadow opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-br from-transparent via-transparent to-primary/5"
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br",
              iconColor
            )}
          >
            <Icon className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        </div>

        {trend && (
          <div
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              trend.isPositive
                ? "bg-success/20 text-success"
                : "bg-destructive/20 text-destructive"
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
