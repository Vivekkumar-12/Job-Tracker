import { cn } from "@/lib/utils";

export function ActivityChart({ weekData = [] }) {
  // Use provided data or default to empty data
  const data = weekData.length > 0 ? weekData : [
    { day: "Mon", applied: 0, interviews: 0 },
    { day: "Tue", applied: 0, interviews: 0 },
    { day: "Wed", applied: 0, interviews: 0 },
    { day: "Thu", applied: 0, interviews: 0 },
    { day: "Fri", applied: 0, interviews: 0 },
    { day: "Sat", applied: 0, interviews: 0 },
    { day: "Sun", applied: 0, interviews: 0 },
  ];

  const maxValue = Math.max(...data.map((d) => d.applied + d.interviews), 1);

  return (
    <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Weekly Activity</h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Applications</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-accent" />
            <span className="text-muted-foreground">Interviews</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((dayData, idx) => (
          <div
            key={dayData.day}
            className={cn(
              "flex-1 flex flex-col items-center gap-2",
              "opacity-0 animate-fade-in"
            )}
            style={{ animationDelay: `${600 + idx * 50}ms` }}
          >
            <div className="relative w-full flex flex-col items-center gap-1">
              {/* Interviews bar */}
              <div
                className="w-full max-w-8 rounded-t-sm bg-accent transition-all duration-500"
                style={{
                  height: `${(dayData.interviews / maxValue) * 100}px`,
                }}
              />
              {/* Applications bar */}
              <div
                className="w-full max-w-8 rounded-t-sm bg-primary transition-all duration-500"
                style={{
                  height: `${(dayData.applied / maxValue) * 100}px`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{dayData.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-2xl font-bold text-primary">
            {data.reduce((sum, d) => sum + d.applied, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Applications this week</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-2xl font-bold text-accent">
            {data.reduce((sum, d) => sum + d.interviews, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Interviews scheduled</p>
        </div>
      </div>
    </div>
  );
}
