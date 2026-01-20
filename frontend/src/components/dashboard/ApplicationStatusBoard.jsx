import { cn } from "@/lib/utils";

const statusConfig = {
  applied: {
    title: "Applied",
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  },
  assessment: {
    title: "Assessment",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  },
  interviewing: {
    title: "Interviewing",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  },
  offered: {
    title: "Offer",
    color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
  },
  rejected: {
    title: "Rejected",
    color: "from-red-500/20 to-rose-500/20 border-red-500/30",
  },
  withdrawn: {
    title: "Withdrawn",
    color: "from-gray-500/20 to-gray-600/20 border-gray-500/30",
  },
};

export function ApplicationStatusBoard({ statusData = [] }) {
  // Transform backend data to columns format
  const statusColumns = statusData.map(stat => ({
    id: stat._id,
    title: statusConfig[stat._id]?.title || stat._id,
    count: stat.count,
    color: statusConfig[stat._id]?.color || statusConfig.applied.color,
  }));

  // Filter out rejected/withdrawn for the board display
  const displayColumns = statusColumns.filter(col => 
    !['rejected', 'withdrawn'].includes(col.id)
  );

  if (displayColumns.length === 0) {
    return (
      <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Application Pipeline</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No applications in the pipeline yet</p>
        </div>
      </div>
    );
  }
  return (
    <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Application Pipeline</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayColumns.map((column, idx) => (
          <div
            key={column.id}
            className={cn(
              "rounded-lg p-4 border bg-gradient-to-b",
              column.color,
              "opacity-0 animate-fade-in"
            )}
            style={{ animationDelay: `${500 + idx * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">{column.title}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-background/50">
                {column.count}
              </span>
            </div>

            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">
                {column.count} {column.count === 1 ? 'application' : 'applications'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
