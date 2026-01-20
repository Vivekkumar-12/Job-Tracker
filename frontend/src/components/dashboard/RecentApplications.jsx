import { ExternalLink, MoreHorizontal, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  applied: { label: "Applied", color: "bg-blue-500/20 text-blue-400" },
  assessment: { label: "Assessment", color: "bg-amber-500/20 text-amber-400" },
  interviewing: { label: "Interviewing", color: "bg-purple-500/20 text-purple-400" },
  offered: { label: "Offer", color: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-500/20 text-gray-400" },
};

export function RecentApplications({ applications = [] }) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/applications');
  };

  const handleViewApplication = (id) => {
    navigate(`/applications/${id}`);
  };
  if (applications.length === 0) {
    return (
      <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <button 
            onClick={handleViewAll}
            className="text-sm text-primary hover:underline"
          >
            View All
          </button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No applications yet. Start tracking your job applications!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Recent Applications</h2>
        <button 
          onClick={handleViewAll}
          className="text-sm text-primary hover:underline"
        >
          View All
        </button>
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
                key={app._id || app.id}
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
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm">{app.jobTitle}</p>
                </td>
                <td className="py-4 px-4 hidden md:table-cell">
                  <p className="text-sm text-muted-foreground">{app.location || 'N/A'}</p>
                </td>
                <td className="py-4 px-4 hidden lg:table-cell">
                  <p className="text-sm font-mono text-muted-foreground">
                    {app.salary || 'Not specified'}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      statusConfig[app.status]?.color || statusConfig.applied.color
                    )}
                  >
                    {statusConfig[app.status]?.label || app.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-1">
                    {app.jobUrl && (
                      <a 
                        href={app.jobUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                        title="Open job posting"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewApplication(app._id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
