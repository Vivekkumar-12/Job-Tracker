import { useState, useEffect } from "react";
import { Search, Bell, Command, LogOut, Settings, X, Share2, Linkedin, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/apiClient";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [networkProfiles, setNetworkProfiles] = useState({
    linkedin: "",
    github: "",
    portfolio: "",
    twitter: "",
  });

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const reminders = await apiClient.reminders.getAll();

        const transformedNotifications = (reminders || []).map((reminder) => ({
          id: reminder._id,
          title: reminder.title,
          description: reminder.notes || "No description",
          timestamp: formatTimestamp(new Date(reminder.reminderDate)),
          read: reminder.isCompleted || false,
          reminderDate: reminder.reminderDate,
        }));

        setNotifications(transformedNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Load network profiles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("networkProfiles");
    if (saved) {
      try {
        setNetworkProfiles(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to parse network profiles", e);
      }
    }
  }, []);

  // Listen for network profile updates from Settings
  useEffect(() => {
    const handleProfilesUpdate = (event) => {
      if (event?.detail) {
        setNetworkProfiles(event.detail);
        return;
      }
      const saved = localStorage.getItem("networkProfiles");
      if (saved) {
        try {
          setNetworkProfiles(JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to parse network profiles", e);
        }
      }
    };

    window.addEventListener("networkProfilesUpdated", handleProfilesUpdate);
    return () => window.removeEventListener("networkProfilesUpdated", handleProfilesUpdate);
  }, []);

  const formatTimestamp = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (username) => {
    if (!username) return "U";
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleClearAll = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setShowSearchResults(true);

      // Fetch applications and resumes with error handling
      let applications = [];
      let resumes = [];
      let jobs = [];

      try {
        const appRes = await apiClient.applications.getAll();
        applications = Array.isArray(appRes) ? appRes : [];
      } catch (error) {
        console.warn("Failed to fetch applications:", error);
      }

      try {
        const resumeRes = await apiClient.resumes.getAll();
        resumes = Array.isArray(resumeRes) ? resumeRes : [];
      } catch (error) {
        console.warn("Failed to fetch resumes:", error);
      }

      try {
        const jobRes = await apiClient.search.jobs({ q: query });
        jobs = Array.isArray(jobRes) ? jobRes : [];
      } catch (error) {
        console.warn("Failed to fetch jobs:", error);
      }

      const q = query.toLowerCase().trim();
      
      // Flexible search function - works with partial matches, multi-word, and case-insensitive
      const matchesQuery = (text) => {
        if (!text) return false;
        const normalizedText = String(text).toLowerCase();
        
        // Check if the entire query is in the text
        if (normalizedText.includes(q)) return true;
        
        // Split query into words and check if all words are present (in any order)
        const queryWords = q.split(/\s+/).filter(w => w.length > 0);
        return queryWords.every(word => normalizedText.includes(word));
      };
      
      const filteredApplications = applications.filter(
        (app) =>
          matchesQuery(app.companyName) ||
          matchesQuery(app.jobTitle) ||
          matchesQuery(app.notes) ||
          matchesQuery(app.location) ||
          matchesQuery(app.status) ||
          matchesQuery(app.salary) ||
          matchesQuery(app.jobType) ||
          matchesQuery(app.workMode) ||
          matchesQuery(JSON.stringify(app))
      );

      const filteredResumes = resumes.filter(
        (resume) =>
          matchesQuery(resume.title) ||
          matchesQuery(resume.subtitle) ||
          matchesQuery(resume.professionalSummary) ||
          matchesQuery(resume.email) ||
          matchesQuery(resume.phone) ||
          matchesQuery(JSON.stringify(resume.experience)) ||
          matchesQuery(JSON.stringify(resume.education)) ||
          matchesQuery(JSON.stringify(resume.skills)) ||
          matchesQuery(JSON.stringify(resume))
      );

      const filteredJobs = jobs.filter(
        (job) =>
          matchesQuery(job.title) ||
          matchesQuery(job.companyName) ||
          matchesQuery(job.location) ||
          matchesQuery(job.jobDescription) ||
          matchesQuery(job.category) ||
          matchesQuery(job.jobType) ||
          matchesQuery(JSON.stringify(job))
      );

      const combined = [
        ...filteredApplications.map((app) => ({
          id: app._id,
          title: app.companyName || 'Untitled Application',
          subtitle: app.jobTitle || 'No job title',
          type: "application",
          path: `/applications/${app._id}`,
        })),
        ...filteredResumes.map((resume) => ({
          id: resume._id,
          title: resume.title || 'Untitled Resume',
          subtitle: resume.subtitle || 'No subtitle',
          type: "resume",
          path: `/resumes`,
          action: () => {
            // Navigate to resumes page - user can find their resume there
            navigate('/resumes');
          }
        })),
        ...filteredJobs.map((job) => ({
          id: job._id,
          title: job.title || 'Untitled Job',
          subtitle: job.companyName || 'No company',
          type: "job",
          path: `/search`,
          action: () => {
            // Navigate to job search - user can find the job there
            navigate('/search');
          }
        })),
      ];

      setSearchResults(combined);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result) => {
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
    
    // Use custom action if available, otherwise navigate to path
    if (result.action) {
      result.action();
    } else {
      navigate(result.path);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-6">
        {/* Logo + Name */}
        <Link to="/" className="mr-6 flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
          <img src="/icon-2.png" alt="JobTracker" className="h-10 w-10 rounded-lg" />
          <span className="text-lg font-semibold gradient-text">JobTracker</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search applications, companies, jobs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
              className="w-full h-10 pl-10 pr-12 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{result.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{result.subtitle}</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded ml-2 whitespace-nowrap">
                        {result.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Network Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-primary/10 border-primary/20 hover:bg-primary/20">
                <Share2 className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">Network</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">Share Your Profile</p>
                <p className="text-xs text-muted-foreground">Connect on professional platforms</p>
              </div>
              <DropdownMenuSeparator />
              
              {networkProfiles.linkedin && (
                <>
                  <DropdownMenuItem onClick={() => window.open(networkProfiles.linkedin, "_blank")} className="cursor-pointer">
                    <Linkedin className="w-4 h-4 mr-2 text-blue-500" />
                    LinkedIn Profile
                  </DropdownMenuItem>
                </>
              )}
              
              {networkProfiles.github && (
                <>
                  <DropdownMenuItem onClick={() => window.open(networkProfiles.github, "_blank")} className="cursor-pointer">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub Profile
                  </DropdownMenuItem>
                </>
              )}
              
              {networkProfiles.portfolio && (
                <DropdownMenuItem onClick={() => window.open(networkProfiles.portfolio, "_blank")} className="cursor-pointer">
                  <Globe className="w-4 h-4 mr-2 text-green-500" />
                  Portfolio Website
                </DropdownMenuItem>
              )}

              {networkProfiles.twitter && (
                <DropdownMenuItem onClick={() => window.open(networkProfiles.twitter, "_blank")} className="cursor-pointer">
                  <svg className="w-4 h-4 mr-2 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter) Profile
                </DropdownMenuItem>
              )}
              
              {!networkProfiles.linkedin && !networkProfiles.github && !networkProfiles.portfolio && !networkProfiles.twitter && (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  No profiles added yet
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer text-primary">
                <Settings className="w-4 h-4 mr-2" />
                Add Profile Links
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {/* Notifications Popover */}
          <Popover open={openNotifications} onOpenChange={setOpenNotifications}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4" align="end">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs h-auto px-2 py-1"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex-1"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground/50 mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </PopoverContent>
          </Popover>

          <div className="h-8 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-3 h-10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.username || "User"}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {getInitials(user?.username || "U")}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

