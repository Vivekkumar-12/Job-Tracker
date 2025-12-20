import { Calendar, Video, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const interviews = [
  {
    id: "1",
    company: "Vercel",
    role: "Staff Engineer - Final Round",
    type: "video",
    date: "Today",
    time: "2:00 PM",
  },
  {
    id: "2",
    company: "Linear",
    role: "Product Engineer - Technical",
    type: "video",
    date: "Tomorrow",
    time: "10:00 AM",
  },
  {
    id: "3",
    company: "Stripe",
    role: "Full Stack Developer - Onsite",
    type: "onsite",
    date: "Dec 20",
    time: "9:00 AM",
  },
];

const typeIcons = {
  video: Video,
  onsite: MapPin,
  phone: Calendar,
};

const typeColors = {
  video: "text-blue-400 bg-blue-500/20",
  onsite: "text-emerald-400 bg-emerald-500/20",
  phone: "text-amber-400 bg-amber-500/20",
};

export function UpcomingInterviews() {
  return (
    <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Upcoming Interviews</h2>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
          {interviews.length} scheduled
        </span>
      </div>

      <div className="space-y-3">
        {interviews.map((interview, idx) => {
          const TypeIcon = typeIcons[interview.type];
          return (
            <div
              key={interview.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all cursor-pointer group",
                "opacity-0 animate-slide-in-left"
              )}
              style={{ animationDelay: `${300 + idx * 100}ms` }}
            >
              {/* Company Logo Placeholder */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary">
                {interview.company.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium group-hover:text-primary transition-colors truncate">
                  {interview.company}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {interview.role}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{interview.time}</span>
                </div>
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    interview.date === "Today"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {interview.date}
                </span>
                <div className={cn("p-1.5 rounded-md", typeColors[interview.type])}>
                  <TypeIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {interviews.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No upcoming interviews scheduled</p>
        </div>
      )}
    </div>
  );
}
