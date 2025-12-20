import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Bell,
  Calendar,
  Clock,
  Building2,
  Mail,
  Phone,
  Video,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const reminders = [
  {
    id: 1,
    title: "Follow up with Google recruiter",
    company: "Google",
    type: "follow-up",
    dueDate: "2024-01-17",
    dueTime: "10:00 AM",
    priority: "high",
    completed: false,
  },
  {
    id: 2,
    title: "Send thank you email to Meta interviewer",
    company: "Meta",
    type: "email",
    dueDate: "2024-01-17",
    dueTime: "2:00 PM",
    priority: "medium",
    completed: false,
  },
  {
    id: 3,
    title: "Prepare for Netflix technical interview",
    company: "Netflix",
    type: "interview",
    dueDate: "2024-01-18",
    dueTime: "11:00 AM",
    priority: "high",
    completed: false,
  },
  {
    id: 4,
    title: "Review Apple job description",
    company: "Apple",
    type: "review",
    dueDate: "2024-01-18",
    dueTime: "4:00 PM",
    priority: "low",
    completed: false,
  },
  {
    id: 5,
    title: "Call Stripe HR for offer details",
    company: "Stripe",
    type: "call",
    dueDate: "2024-01-19",
    dueTime: "9:00 AM",
    priority: "high",
    completed: false,
  },
];

const completedReminders = [
  {
    id: 6,
    title: "Submit Amazon application",
    company: "Amazon",
    type: "application",
    dueDate: "2024-01-15",
    dueTime: "5:00 PM",
    priority: "medium",
    completed: true,
  },
  {
    id: 7,
    title: "Update LinkedIn profile",
    company: "General",
    type: "task",
    dueDate: "2024-01-14",
    dueTime: "3:00 PM",
    priority: "low",
    completed: true,
  },
];

const typeIcons = {
  "follow-up": Mail,
  email: Mail,
  interview: Video,
  review: CheckCircle2,
  call: Phone,
  application: Building2,
  task: CheckCircle2,
};

const priorityConfig = {
  high: {
    label: "High",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  low: {
    label: "Low",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
};

const Reminders = () => {
  const [activeReminders, setActiveReminders] = useState(reminders);

  const toggleComplete = (id) => {
    setActiveReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const today = new Date().toISOString().split("T")[0];
  const todayReminders = activeReminders.filter(
    (r) => r.dueDate === "2024-01-17" && !r.completed
  );
  const upcomingReminders = activeReminders.filter(
    (r) => r.dueDate > "2024-01-17" && !r.completed
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />

        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Reminders</h1>
              <p className="text-muted-foreground mt-1">
                Stay on top of your job search tasks and deadlines
              </p>
            </div>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-0 animate-fade-in animation-delay-100">
            <Card className="glass">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayReminders.length}</p>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingReminders.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedReminders.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="active" className="opacity-0 animate-fade-in animation-delay-200">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4 space-y-6">
              {/* Today's Reminders */}
              {todayReminders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Today
                  </h3>
                  <div className="space-y-3">
                    {todayReminders.map((reminder, idx) => {
                      const Icon = typeIcons[reminder.type] || Bell;
                      return (
                        <Card
                          key={reminder.id}
                          className="glass glass-hover opacity-0 animate-fade-in"
                          style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={reminder.completed}
                                onCheckedChange={() => toggleComplete(reminder.id)}
                                className="border-primary data-[state=checked]:bg-primary"
                              />
                              <div className="p-2 rounded-lg bg-primary/20">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium">{reminder.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Building2 className="w-3 h-3" />
                                  <span>{reminder.company}</span>
                                  <span className="text-border">•</span>
                                  <Clock className="w-3 h-3" />
                                  <span>{reminder.dueTime}</span>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={priorityConfig[reminder.priority].className}
                              >
                                {priorityConfig[reminder.priority].label}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming Reminders */}
              {upcomingReminders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Upcoming
                  </h3>
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder, idx) => {
                      const Icon = typeIcons[reminder.type] || Bell;
                      return (
                        <Card
                          key={reminder.id}
                          className="glass glass-hover opacity-0 animate-fade-in"
                          style={{ animationDelay: `${(idx + 5) * 100}ms` }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={reminder.completed}
                                onCheckedChange={() => toggleComplete(reminder.id)}
                                className="border-primary data-[state=checked]:bg-primary"
                              />
                              <div className="p-2 rounded-lg bg-secondary">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium">{reminder.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Building2 className="w-3 h-3" />
                                  <span>{reminder.company}</span>
                                  <span className="text-border">•</span>
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(reminder.dueDate).toLocaleDateString()}
                                  </span>
                                  <span className="text-border">•</span>
                                  <Clock className="w-3 h-3" />
                                  <span>{reminder.dueTime}</span>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={priorityConfig[reminder.priority].className}
                              >
                                {priorityConfig[reminder.priority].label}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <div className="space-y-3">
                {completedReminders.map((reminder, idx) => {
                  const Icon = typeIcons[reminder.type] || Bell;
                  return (
                    <Card
                      key={reminder.id}
                      className="glass opacity-60"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={true}
                            className="border-primary data-[state=checked]:bg-primary"
                          />
                          <div className="p-2 rounded-lg bg-secondary">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-through text-muted-foreground">
                              {reminder.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Building2 className="w-3 h-3" />
                              <span>{reminder.company}</span>
                              <span className="text-border">•</span>
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(reminder.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Reminders;
