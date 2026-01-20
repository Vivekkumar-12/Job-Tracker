import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

const typeIcons = {
  "interview": Video,
  "followup": Mail,
  "deadline": Clock,
  "other": Bell,
  // Legacy mappings for backward compatibility
  "follow-up": Mail,
  "email": Mail,
  "review": CheckCircle2,
  "call": Phone,
  "application": Building2,
  "task": CheckCircle2,
};

const typeLabels = {
  "interview": "Interview",
  "followup": "Follow-up",
  "deadline": "Deadline",
  "other": "Other",
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

// ReminderCard Component
const ReminderCard = ({ reminder, idx, onToggleComplete, onEdit, onDelete, upcoming = false, completed = false }) => {
  const Icon = typeIcons[reminder.type] || Bell;
  const reminderDate = new Date(reminder.reminderDate);
  const timeStr = reminderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <Card
      className={`glass ${completed ? 'opacity-60' : 'glass-hover'} opacity-0 animate-fade-in`}
      style={{ animationDelay: `${idx * 100}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={reminder.isCompleted}
            onCheckedChange={() => onToggleComplete(reminder)}
            className="border-primary data-[state=checked]:bg-primary"
          />
          <div className={`p-2 rounded-lg ${upcoming || completed ? 'bg-secondary' : 'bg-primary/20'}`}>
            <Icon className={`w-4 h-4 ${upcoming || completed ? 'text-muted-foreground' : 'text-primary'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
              {reminder.title}
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
              {reminder.company && (
                <>
                  <Building2 className="w-3 h-3" />
                  <span>{reminder.company}</span>
                  <span className="text-border">•</span>
                </>
              )}
              <Calendar className="w-3 h-3" />
              <span>{reminderDate.toLocaleDateString()}</span>
              {timeStr && (
                <>
                  <span className="text-border">•</span>
                  <Clock className="w-3 h-3" />
                  <span>{timeStr}</span>
                </>
              )}
            </div>
            {reminder.description && (
              <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
            )}
          </div>
          {reminder.priority && !completed && (
            <Badge
              variant="outline"
              className={priorityConfig[reminder.priority]?.className || priorityConfig.medium.className}
            >
              {priorityConfig[reminder.priority]?.label || 'Medium'}
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(reminder)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(reminder._id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

const Reminders = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminderDate: "",
    reminderTime: "",
    type: "other",
    priority: "medium",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch reminders on mount
  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.reminders.getAll();
      setReminders(data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast({
        title: "Error",
        description: "Failed to load reminders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (reminder = null) => {
    if (reminder) {
      // Edit mode
      const reminderDate = new Date(reminder.reminderDate);
      const dateStr = reminderDate.toISOString().split('T')[0];
      const timeStr = reminderDate.toTimeString().slice(0, 5);
      
      setEditingReminder(reminder);
      setFormData({
        title: reminder.title || "",
        description: reminder.description || "",
        reminderDate: dateStr,
        reminderTime: timeStr,
        type: reminder.type || "other",
        priority: reminder.priority || "medium",
        company: reminder.company || "",
      });
    } else {
      // Create mode
      setEditingReminder(null);
      setFormData({
        title: "",
        description: "",
        reminderDate: "",
        reminderTime: "",
        type: "other",
        priority: "medium",
        company: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReminder(null);
    setFormData({
      title: "",
      description: "",
      reminderDate: "",
      reminderTime: "",
      type: "other",
      priority: "medium",
      company: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.reminderDate) {
      toast({
        title: "Validation Error",
        description: "Title and date are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Combine date and time
      const dateTime = formData.reminderTime 
        ? `${formData.reminderDate}T${formData.reminderTime}:00`
        : `${formData.reminderDate}T12:00:00`;
      
      const payload = {
        title: formData.title,
        description: formData.description,
        reminderDate: new Date(dateTime).toISOString(),
        type: formData.type,
        priority: formData.priority,
        company: formData.company,
      };

      if (editingReminder) {
        // Update existing reminder
        await apiClient.reminders.update(editingReminder._id, payload);
        toast({
          title: "Success",
          description: "Reminder updated successfully.",
        });
      } else {
        // Create new reminder
        await apiClient.reminders.create(payload);
        toast({
          title: "Success",
          description: "Reminder created successfully.",
        });
      }

      await fetchReminders();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this reminder?")) {
      return;
    }

    try {
      await apiClient.reminders.delete(id);
      toast({
        title: "Success",
        description: "Reminder deleted successfully.",
      });
      await fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Error",
        description: "Failed to delete reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (reminder) => {
    try {
      if (reminder.isCompleted) {
        // If already completed, update to mark as incomplete
        await apiClient.reminders.update(reminder._id, { isCompleted: false });
      } else {
        // Mark as complete
        await apiClient.reminders.complete(reminder._id);
      }
      await fetchReminders();
    } catch (error) {
      console.error("Error toggling reminder completion:", error);
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter reminders
  const activeReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  const today = new Date().toISOString().split("T")[0];
  const todayReminders = activeReminders.filter((r) => {
    const reminderDate = new Date(r.reminderDate).toISOString().split("T")[0];
    return reminderDate === today;
  });
  const upcomingReminders = activeReminders.filter((r) => {
    const reminderDate = new Date(r.reminderDate).toISOString().split("T")[0];
    return reminderDate > today;
  });

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
            <Button variant="gradient" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
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
                  {activeReminders.length === 0 ? (
                    <Card className="glass">
                      <CardContent className="p-12 text-center">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No active reminders</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first reminder to stay organized
                        </p>
                        <Button variant="gradient" onClick={() => handleOpenDialog()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Reminder
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Today's Reminders */}
                      {todayReminders.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Today
                          </h3>
                          <div className="space-y-3">
                            {todayReminders.map((reminder, idx) => (
                              <ReminderCard
                                key={reminder._id}
                                reminder={reminder}
                                idx={idx + 3}
                                onToggleComplete={handleToggleComplete}
                                onEdit={handleOpenDialog}
                                onDelete={handleDelete}
                              />
                            ))}
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
                            {upcomingReminders.map((reminder, idx) => (
                              <ReminderCard
                                key={reminder._id}
                                reminder={reminder}
                                idx={idx + 5}
                                onToggleComplete={handleToggleComplete}
                                onEdit={handleOpenDialog}
                                onDelete={handleDelete}
                                upcoming
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                  {completedReminders.length === 0 ? (
                    <Card className="glass">
                      <CardContent className="p-12 text-center">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No completed reminders</h3>
                        <p className="text-muted-foreground">
                          Completed reminders will appear here
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {completedReminders.map((reminder, idx) => (
                        <ReminderCard
                          key={reminder._id}
                          reminder={reminder}
                          idx={idx}
                          onToggleComplete={handleToggleComplete}
                          onEdit={handleOpenDialog}
                          onDelete={handleDelete}
                          completed
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingReminder ? "Edit Reminder" : "Create New Reminder"}
            </DialogTitle>
            <DialogDescription>
              {editingReminder
                ? "Update your reminder details below."
                : "Set up a new reminder to stay on track with your job search."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title *
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Follow up with recruiter"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add additional details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="reminderDate" className="text-sm font-medium">
                    Date *
                  </label>
                  <Input
                    id="reminderDate"
                    type="date"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="reminderTime" className="text-sm font-medium">
                    Time
                  </label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Company
                </label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Type
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([value, { label }]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingReminder ? "Update" : "Create"} Reminder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Reminders;
