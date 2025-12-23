import { ExternalLink, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const applications = [
  {
    id: "1",
    company: "Google",
    role: "Senior Frontend Engineer",
    location: "Mountain View, CA",
    status: "interview",
    appliedDate: "Dec 10, 2024",
    salary: "$180k - $220k",
  },
  {
    id: "2",
    company: "Figma",
    role: "Design Engineer",
    location: "San Francisco, CA",
    status: "offer",
    appliedDate: "Dec 8, 2024",
    salary: "$160k - $200k",
  },
  {
    id: "3",
    company: "Vercel",
    role: "Staff Software Engineer",
    location: "Remote",
    status: "screening",
    appliedDate: "Dec 5, 2024",
    salary: "$200k - $250k",
  },
  {
    id: "4",
    company: "Stripe",
    role: "Full Stack Developer",
    location: "Seattle, WA",
    status: "applied",
    appliedDate: "Dec 3, 2024",
    salary: "$170k - $210k",
  },
  {
    id: "5",
    company: "Notion",
    role: "Product Engineer",
    location: "New York, NY",
    status: "rejected",
    appliedDate: "Nov 28, 2024",
    salary: "$150k - $180k",
  },
];

const statusConfig = {
  applied: { label: "Applied", color: "bg-blue-500/20 text-blue-400" },
  screening: { label: "Screening", color: "bg-amber-500/20 text-amber-400" },
  interview: { label: "Interview", color: "bg-purple-500/20 text-purple-400" },
  offer: { label: "Offer", color: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400" },
};

export function RecentApplications() {
  return (
    <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Recent Applications</h2>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Company
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Location
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Salary
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, idx) => (
              <tr
                key={app.id}
                className={cn(
                  "border-b border-border/50 hover:bg-secondary/30 transition-colors",
                  "opacity-0 animate-fade-in"
                )}
                style={{ animationDelay: `${400 + idx * 50}ms` }}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{app.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.appliedDate}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm">{app.role}</p>
                </td>
                <td className="py-4 px-4 hidden md:table-cell">
                  <p className="text-sm text-muted-foreground">{app.location}</p>
                </td>
                <td className="py-4 px-4 hidden lg:table-cell">
                  <p className="text-sm font-mono text-muted-foreground">
                    {app.salary}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      statusConfig[app.status].color
                    )}
                  >
                    {statusConfig[app.status].label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
