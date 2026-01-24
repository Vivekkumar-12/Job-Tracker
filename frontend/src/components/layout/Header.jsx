import { useState, useEffect, useMemo } from "react";
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
import { globalSearch } from "@/lib/globalSearch";

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

  // Enhanced highlight text function - creates "Ctrl+F" visual effect
  const highlightText = (text, highlight) => {
    if (!highlight.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-500 text-gray-900 dark:text-gray-900 rounded-sm px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

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

      // Use global search helper to score and rank results
      const results = await globalSearch(query);

      // Format results for display with metadata and ranking
      const formattedResults = results
        .slice(0, 20) // Limit to top 20 results
        .map((item) => {
          const typeConfig = {
            application: {
              icon: "📋",
              label: "Application",
              color: "text-blue-500",
            },
            resume: {
              icon: "📄",
              label: "Resume",
              color: "text-green-500",
            },
            coverLetter: {
              icon: "📝",
              label: "Cover Letter",
              color: "text-purple-500",
            },
            reminder: {
              icon: "⏰",
              label: "Reminder",
              color: "text-orange-500",
            },
            jobListing: {
              icon: "💼",
              label: "Job",
              color: "text-indigo-500",
            },
          };

          const config = typeConfig[item.type] || {
            icon: "📌",
            label: item.type,
            color: "text-gray-500",
          };

          return {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle || item.metadata?.company || item.metadata?.location || "",
            type: item.type,
            icon: config.icon,
            label: config.label,
            score: item.score ?? item.matchScore ?? 0,
            metadata: item.metadata,
            path: item.path,
            action: item.action,
          };
        });

      setSearchResults(formattedResults);
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
              className="w-full h-10 pl-10 pr-24 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {searchQuery && searchResults.length > 0 ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                {searchResults.length} {searchResults.length === 1 ? 'Match' : 'Matches'}
              </div>
            ) : !searchQuery ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            ) : null}
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-2 bg-muted/50 border-b border-border">
                <p className="text-xs font-medium text-muted-foreground">
                  {searchQuery ? `Search Results (${searchResults.length} found)` : 'Recent Searches'}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary/70 transition-colors border-b border-border/50 last:border-b-0 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{result.icon}</span>
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors flex-1">
                            {highlightText(result.title, searchQuery)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {highlightText(result.subtitle, searchQuery)}
                        </p>
                        {result.metadata && (
                          <div className="text-xs text-muted-foreground/70 mt-1 space-x-2">
                            {result.metadata.date && (
                              <span>📅 {new Date(result.metadata.date).toLocaleDateString()}</span>
                            )}
                            {result.metadata.status && (
                              <span>• {result.metadata.status}</span>
                            )}
                            {result.metadata.location && (
                              <span>📍 {result.metadata.location}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {result.score && (
                          <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                            {Math.round(result.score)}%
                          </span>
                        )}
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap capitalize">
                          {result.label}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {showSearchResults && searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-6 text-center">
              <p className="text-sm text-muted-foreground italic">No matches found for "{searchQuery}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try different keywords or check spelling</p>
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

