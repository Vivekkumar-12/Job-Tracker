import { cn } from "@/lib/utils";

const statusColumns = [
  {
    id: "applied",
    title: "Applied",
    count: 12,
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    items: [
      { company: "Google", role: "Frontend Engineer", daysAgo: 2 },
      { company: "Meta", role: "React Developer", daysAgo: 5 },
      { company: "Stripe", role: "Full Stack Dev", daysAgo: 7 },
    ],
  },
  {
    id: "screening",
    title: "Phone Screen",
    count: 4,
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    items: [
      { company: "Netflix", role: "Senior SWE", daysAgo: 1 },
      { company: "Airbnb", role: "UI Engineer", daysAgo: 3 },
    ],
  },
  {
    id: "interview",
    title: "Interview",
    count: 3,
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    items: [
      { company: "Vercel", role: "Staff Engineer", daysAgo: 0 },
      { company: "Linear", role: "Product Engineer", daysAgo: 2 },
    ],
  },
  {
    id: "offer",
    title: "Offer",
    count: 1,
    color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    items: [{ company: "Figma", role: "Design Engineer", daysAgo: 1 }],
  },
];

export function ApplicationStatusBoard() {
  return (
    <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Application Pipeline</h2>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column, idx) => (
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

            <div className="space-y-2">
              {column.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="bg-card/80 backdrop-blur-sm rounded-lg p-3 hover:bg-card transition-colors cursor-pointer group"
                >
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {item.company}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.role}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {item.daysAgo === 0 ? "Today" : `${item.daysAgo}d ago`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
