import { Calendar, Video, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons = {
  interview: Video,
  video: Video,
  onsite: MapPin,
  phone: Calendar,
};

const typeColors = {
  interview: "text-blue-400 bg-blue-500/20",
  video: "text-blue-400 bg-blue-500/20",
  onsite: "text-emerald-400 bg-emerald-500/20",
  phone: "text-amber-400 bg-amber-500/20",
};

export function UpcomingInterviews({ upcomingReminders = [] }) {
  // Filter only interview type reminders
  const interviews = upcomingReminders.filter(r => r.type === 'interview');

  if (interviews.length === 0) {
    return (
      <div className="glass rounded-xl p-6 card-shadow opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Upcoming Interviews</h2>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
            0 scheduled
          </span>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No upcoming interviews scheduled</p>
        </div>
      </div>
    );
  }
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
        {interviews.map((reminder, idx) => {
          const TypeIcon = typeIcons[reminder.type] || Video;
          const reminderDate = new Date(reminder.reminderDate);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          let dateLabel;
          if (reminderDate.toDateString() === today.toDateString()) {
            dateLabel = "Today";
          } else if (reminderDate.toDateString() === tomorrow.toDateString()) {
            dateLabel = "Tomorrow";
          } else {
            dateLabel = reminderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          
          const timeStr = reminderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          
          return (
            <div
              key={reminder._id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all cursor-pointer group",
                "opacity-0 animate-slide-in-left"
              )}
              style={{ animationDelay: `${300 + idx * 100}ms` }}
            >
              {/* Company Logo Placeholder */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary">
                {reminder.company ? reminder.company.charAt(0) : 'I'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium group-hover:text-primary transition-colors truncate">
                  {reminder.company || 'Interview'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {reminder.title}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{timeStr}</span>
                </div>
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    dateLabel === "Today"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {dateLabel}
                </span>
                <div className={cn("p-1.5 rounded-md", typeColors[reminder.type] || typeColors.interview)}>
                  <TypeIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
